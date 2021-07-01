import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import _ from 'lodash';
import { Table } from 'antd';
import { TablePaginationConfig, TableProps, ColumnType } from 'antd/es/table';
import ConfigProvider from '../unrelated/ConfigProvider';
import ResizableTitle from './ResizableTitle';
import EditableCell, { EditableRow, EditableColumnsType } from './EditableCell';
import { AnyObjectType, PromiseAxiosResultType } from '../unrelated/typings';
import './index.less';

// 导出表格头类型
export type TableColumns<T = AnyObjectType> = ColumnType<T> & Partial<EditableColumnsType>;

// 导出该组件可调用的方法类型
export interface TableCallType {
  setTableLoading: (data: boolean) => void;
  setRowSelected: (selectedRowKeys: string[]) => void;
  getTableList: (values?: AnyObjectType, callBack?: () => void) => void;
  getSelectIds: () => string[];
  removeSelectIds: (data: string[]) => void;
  getSelectRowsArray: () => AnyObjectType[];
  getStaticDataList: () => AnyObjectType[];
}

export type ScrollXYType = {
  x?: string | number | true | undefined;
  y?: string | number | undefined;
};

// 组件传参配置
interface GenerateTableProp {
  /** 支持antd Table组件官方传参所有类型 */
  tableConfig?: TableProps<any>;
  /** 是否开启表格行选中 checkbox多选 radio单选 */
  rowType?: 'checkbox' | 'radio' | undefined;
  /** 开启固定列参数 */
  scroll?: ScrollXYType;
  /** 列表请求函数 */
  apiMethod?: (data: any) => PromiseAxiosResultType;
  /** 表格头 */
  columns: ColumnType<AnyObjectType>[];
  /** 静态表格数据 */
  data?: AnyObjectType[];
  /** 行选中回调 */
  onSelect?: (selectedRows: AnyObjectType[], selectedRowKeys: any[]) => void;
  /** 控制分页格式 */
  paginationConfig?: false | TablePaginationConfig;
  /** 选择框的默认属性配置 */
  getCheckboxProps?: (record: AnyObjectType) => AnyObjectType;
}

/** 表格组件 */
const GenerateTable = (props: GenerateTableProp, ref: any) => {
  const { tableConfig, rowType, scroll, apiMethod, columns } = props;
  const queryParameters = useRef<AnyObjectType>(); // 额外查询参数
  const queryPagination = useRef<TablePaginationConfig>({
    current: 1, // 当前第几页
    total: 10, // 总共多少条
    pageSize: 10, // 每页显示多少条数据
    showSizeChanger: true, // 显示分页总数量
  });
  const [formatColumns, setFormatColumns] = useState<any[]>(columns); // 表格头
  const [listLoading, setListLoading] = useState(false); // 列表loading
  const [listData, setListData] = useState<any[]>([]); // 列表数据
  const [selectRowIds, setSelectRowIds] = useState<string[]>([]); // 表格选中行的ids
  const [selectRowArray, setSelectRowArray] = useState<AnyObjectType[]>([]); // 表格选中行的所有数组
  // 表格横向纵向滚动条
  const [scrollXY, setScrollXY] = useState<ScrollXYType>({
    x: 'max-content',
    y: 315,
  });

  /**
   * @Description 获取表格数据 values包含{ updateSelected: false }时，不会更新复选框和单选选中的值
   * @Author bihongbin
   * @Date 2020-06-24 14:43:05
   */
  const getList = useCallback(
    async (values?: AnyObjectType) => {
      let updateSelected = true; // 加载列表时，是否更新复选框和单选选中的值（默认更新）
      setListLoading(true);
      if (values) {
        if (values.updateSelected !== undefined) {
          updateSelected = values.updateSelected;
          delete values.updateSelected;
        }
        queryParameters.current = {
          ...queryParameters.current,
          ...values,
        };
      }
      try {
        const queryParams: AnyObjectType = {
          page: queryPagination.current.current,
          size: queryPagination.current.pageSize,
          ...queryParameters.current,
        };
        // 查询时，分页重置到第一页
        if (values && values.current) {
          queryParams.page = values.current;
          queryPagination.current.current = values.current;
        }
        if (apiMethod) {
          delete queryParams.current;
          const result = await apiMethod(_.pickBy(queryParams, _.identity));
          queryPagination.current.total = result.data.total;
          // 更新表格选中的数据id
          if (_.isArray(result.data.content)) {
            if (updateSelected) {
              let rowIds: string[] = [];
              let rowData: AnyObjectType[] = [];
              // 递归
              const deepTable = (list: AnyObjectType[]) => {
                if (selectRowIds.length) {
                  for (let item of list) {
                    for (let ids of selectRowIds) {
                      if (tableConfig && tableConfig.rowKey) {
                        if (typeof tableConfig.rowKey === 'string') {
                          if (item[tableConfig.rowKey] === ids) {
                            rowIds.push(ids);
                            rowData.push(item);
                          }
                        }
                      } else {
                        if (item.id === ids) {
                          rowIds.push(ids);
                          rowData.push(item);
                        }
                      }
                    }
                    if (item.children) {
                      deepTable(item.children);
                    }
                  }
                }
              };
              deepTable(result.data.content);
              setSelectRowIds(rowIds);
              setSelectRowArray(rowData);
            }
            setListData(result.data.content);
          }
        }
      } catch (error) {}
      setListLoading(false);
    },
    [apiMethod, selectRowIds, tableConfig],
  );

  /**
   * @Description 分页切换
   * @Author bihongbin
   * @Date 2020-06-24 14:05:28
   */
  const changeEstimatesList = (pagination: TablePaginationConfig) => {
    queryPagination.current = pagination;
    getList({ updateSelected: false });
  };

  /**
   * @Description 行选择
   * @Author bihongbin
   * @Date 2020-06-24 15:16:07
   */
  const rowSelection = useMemo(
    () => ({
      fixed: true,
      type: rowType,
      selectedRowKeys: selectRowIds,
      getCheckboxProps: props.getCheckboxProps,
      onSelectAll: (selected, selectedRows, changeRows) => {
        let ids = [...selectRowIds];
        let rows = [...selectRowArray];
        if (selected) {
          ids = _.uniq([...ids, ...changeRows.map((item) => item.id)]);
          rows = _.uniqBy([...rows, ...changeRows], 'id');
        } else {
          for (let i of ids) {
            if (!changeRows.some((item) => item.id === i)) {
              ids.push(i);
            }
          }
          for (let i of rows) {
            if (!changeRows.some((item) => item.id === i.id)) {
              rows.push(i);
            }
          }
        }
        setSelectRowIds(ids);
        setSelectRowArray(rows);
        props.onSelect && props.onSelect(rows, ids);
      },
      onSelect: (record, selected) => {
        let ids = [...selectRowIds];
        let rows = [...selectRowArray];
        if (rowType === 'checkbox') {
          if (selected) {
            ids.push(record.id);
            rows.push(record);
          } else {
            ids = ids.filter((item) => item !== record.id);
            rows = rows.filter((item) => item.id !== record.id);
          }
        }
        if (rowType === 'radio') {
          if (selected) {
            ids = [record.id];
            rows = [record];
          }
        }
        setSelectRowIds(ids);
        setSelectRowArray(rows);
        props.onSelect && props.onSelect(rows, ids);
      },
    }),
    [props, rowType, selectRowArray, selectRowIds],
  );

  /**
   * @Description 表头拖动重置宽度
   * @Author bihongbin
   * @Date 2020-07-21 10:36:35
   */
  const handleResize = (index: number) => (e: any, { size }: any) => {
    setFormatColumns((prev) => {
      const nextColumns = [...prev];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      return nextColumns;
    });
  };

  /**
   * @Description 保存input数据
   * @Author bihongbin
   * @Date 2020-09-24 12:04:56
   */
  const handleSave = useCallback(
    (row: AnyObjectType) => {
      const newData = [...listData];
      const index = newData.findIndex((item) => row.id === item.id);
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
      });
      setListData(newData);
    },
    [listData],
  );

  /**
   * @Description 设置表头
   * @Author bihongbin
   * @Date 2020-07-21 09:31:16
   */
  useEffect(() => {
    let columns = [...props.columns];
    // 添加序号
    if (!columns.some((item) => item.dataIndex === 'sequence')) {
      columns.unshift({
        width: 50,
        fixed: 'left',
        title: '序号',
        dataIndex: 'sequence',
        render: (text, record, index) => {
          const pages = queryPagination.current;
          if (Object.keys(pages).length) {
            return (pages.current - 1) * pages.pageSize + index + 1;
          } else {
            return index + 1;
          }
        },
      });
    }
    columns = columns.map((col: AnyObjectType, index) => {
      let obj: AnyObjectType = {
        ...col,
        onHeaderCell: (column: any) => ({
          width: column.width,
          onResize: handleResize(index),
        }),
      };
      if (col.editable) {
        obj.onCell = (record: AnyObjectType, i: number) => ({
          record,
          editable: typeof col.editable === 'function' ? col.editable(record, i) : col.editable,
          inputType: col.inputType,
          valueType: col.valueType,
          valueEnum: col.valueEnum,
          recordSelectField: col.recordSelectField,
          formChange: col.formChange,
          remoteConfig: col.remoteConfig,
          formItemProps: col.formItemProps,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: handleSave,
        });
      }
      return obj;
    });
    setFormatColumns(columns);
  }, [handleSave, props.columns]);

  /**
   * @Description 更新表格行选中的数据
   * @Author bihongbin
   * @Date 2020-10-29 17:37:10
   */
  useEffect(() => {
    let rows: AnyObjectType[] = [];
    // 递归
    const deepTable = (list: AnyObjectType[]) => {
      for (let item of list) {
        for (let ids of selectRowIds) {
          if (tableConfig && tableConfig.rowKey) {
            if (typeof tableConfig.rowKey === 'string') {
              if (item[tableConfig.rowKey] === ids) {
                rows.push(item);
              }
            }
          } else {
            if (item.id === ids) {
              rows.push(item);
            }
          }
        }
        if (item.children) {
          deepTable(item.children);
        }
      }
    };
    deepTable(listData);
    setSelectRowArray((prev) => {
      return _.unionBy([...prev, ...rows], (tableConfig && tableConfig.rowKey) || 'id');
    });
  }, [listData, selectRowIds, tableConfig]);

  /**
   * @Description 设置静态表格数据
   * @Author bihongbin
   * @Date 2020-07-13 09:16:45
   */
  useEffect(() => {
    if (_.isArray(props.data)) {
      setListData(props.data || []);
    }
  }, [props.data]);

  /**
   * @Description 固定列
   * @Author bihongbin
   * @Date 2020-06-28 10:33:20
   */
  useEffect(() => {
    const sliderMenu = document.getElementById('slider-menu');
    if (scroll?.x || scroll?.y) {
      setScrollXY((prev) => ({ ...prev, ...scroll }));
    } else {
      // 计算宽度 body.width - 左侧边栏宽度 - 右侧内容区padding*2
      if (sliderMenu) {
        setScrollXY((prev) => {
          prev.x = document.body.clientWidth - sliderMenu.clientWidth - 77;
          return prev;
        });
      }
    }
  }, [listData, scroll]);

  // 暴漏给父组件调用
  useImperativeHandle<any, TableCallType>(ref, () => ({
    // 设置loading
    setTableLoading: (data) => {
      setListLoading(data);
    },
    // 调用接口获取表格数据
    getTableList: async (values, callback) => {
      // 重置分页
      if (values && values.current === undefined) {
        values.current = 1;
      }
      await getList(values);
      // 查询回调
      if (callback) {
        callback();
      }
    },
    // 设置表格选中行
    setRowSelected: (selectedRowKeys) => {
      setSelectRowIds(selectedRowKeys);
    },
    // 获取表格选中的id
    getSelectIds: () =>
      selectRowArray.map((item) => {
        if (tableConfig && tableConfig.rowKey) {
          if (typeof tableConfig.rowKey === 'string') {
            return item[tableConfig.rowKey];
          } else {
            return undefined;
          }
        } else {
          return item.id;
        }
      }),
    // 获取表格选中的数组对象
    getSelectRowsArray: () => selectRowArray,
    // 移除表格选中的id和项
    removeSelectIds: (data) => {
      setSelectRowIds((prev) => {
        return prev.filter((item) => {
          let bool = true;
          for (let i of data) {
            if (i === item) {
              bool = false;
              break;
            }
          }
          return bool;
        });
      });
      setSelectRowArray((prev) => {
        return prev.filter((item) => {
          let bool = true;
          for (let i of data) {
            if (i === item.id) {
              bool = false;
              break;
            }
          }
          return bool;
        });
      });
    },
    // 获取表格所有数据
    getStaticDataList: () => listData,
  }));

  return (
    <ConfigProvider>
      <Table
        rowKey="id"
        rowClassName="editable-row"
        loading={listLoading}
        bordered
        components={{
          header: {
            cell: ResizableTitle,
          },
          body: {
            row: EditableRow,
            cell: EditableCell,
          },
        }}
        columns={formatColumns}
        dataSource={listData}
        rowSelection={rowType ? rowSelection : undefined}
        pagination={
          _.isFunction(props.apiMethod)
            ? {
                size: 'small',
                position: ['bottomCenter'],
                showTotal: (total) => `共${total}条`,
                showSizeChanger: true,
                ...queryPagination.current,
                ...props.paginationConfig,
              }
            : false
        }
        onChange={changeEstimatesList}
        scroll={scrollXY}
        {...tableConfig}
      />
    </ConfigProvider>
  );
};

export default forwardRef(GenerateTable);
