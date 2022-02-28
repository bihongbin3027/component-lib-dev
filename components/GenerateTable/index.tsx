import React, {
  useState,
  useRef,
  useImperativeHandle,
  useMemo,
  useCallback,
  useEffect,
  forwardRef,
} from 'react';
import _ from 'lodash';
import { Table } from 'antd';
import { TablePaginationConfig, TableProps, ColumnType } from 'antd/es/table';
import ConfigProvider from '../unrelated/ConfigProvider';
import ResizableTitle from './ResizableTitle';
import EditableCell, { EditableRow, EditableColumnsType } from './EditableCell';
import { AnyObjectType, PromiseAxiosResultType } from '../unrelated/typings';
import { isEqualWith } from '../unrelated/utils';
import './index.less';

// 导出表格头类型
export type TableColumns<T = AnyObjectType> = ColumnType<T> & Partial<EditableColumnsType>;

// 导出该组件可调用的方法类型
export interface TableCallType {
  setTableLoading: (data: boolean) => void;
  getPages: () => TablePaginationType | undefined;
  setRowSelected: (selectedRowKeys: string[]) => void;
  getTableList: (values?: AnyObjectType, callBack?: () => void) => void;
  getSelectIds: () => string[];
  removeSelectIds: (data: string[]) => void;
  getSelectRowsArray: () => AnyObjectType[];
  getStaticDataList: () => AnyObjectType[];
  setStaticDataList: (row: AnyObjectType | AnyObjectType[], callback?: () => void) => void;
}

export type ScrollXYType = {
  x?: string | number | true | undefined;
  y?: string | number | undefined;
};

// 组件传参配置
interface GenerateTableProp {
  extra: {
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
    /** 表格数据编辑是否是受控组件 默认是 */
    controlled?: boolean;
    /** 行选中回调 */
    onSelect?: (selectedRows: AnyObjectType[], selectedRowKeys: any[]) => void;
    /** 控制分页格式 */
    paginationConfig?: false | TablePaginationConfig;
    /** 选择框的默认属性配置 */
    getCheckboxProps?: (record: AnyObjectType) => AnyObjectType;
    /** 数据调用成功回调 */
    getTableSuccessData?: (data: AnyObjectType) => void;
  };
}

type TablePaginationType = TablePaginationConfig & { pages: number };

/** 表格组件 */
const GenerateTable = (props: GenerateTableProp, ref: any) => {
  // 父级props
  const extraProps = useMemo(() => {
    const extra = (props.extra || {}) as GenerateTableProp['extra'];

    return {
      tableConfig: extra.tableConfig,
      rowType: extra.rowType,
      scroll: extra.scroll,
      apiMethod: extra.apiMethod,
      columns: extra.columns || [],
      data: extra.data,
      controlled: extra.controlled,
      getTableSuccessData: extra.getTableSuccessData,
      onSelect: extra.onSelect,
      paginationConfig: extra.paginationConfig,
      getCheckboxProps: extra.getCheckboxProps,
    };
  }, [props.extra]);

  const queryParameters = useRef<AnyObjectType>(); // 额外查询参数
  let isShowPagination = useRef<boolean>(true); // 是否显示分页，默认显示
  const queryPagination = useRef<TablePaginationType>({
    position: ['bottomCenter'], // 分页位置
    size: 'small', // 分页显示大小
    current: 1, // 当前第几页
    total: 0, // 总共多少条
    pages: 0, // 总共多少页
    pageSize: 10, // 每页显示多少条数据
    showSizeChanger: true, // 显示分页总数量
  });
  const columnsCacheRef = useRef([]); // 缓存表格头拖拽以后的数据
  const [formatColumns, setFormatColumns] = useState<any[]>(extraProps.columns); // 表格头
  const [listLoading, setListLoading] = useState(false); // 列表loading
  const [listData, setListData] = useState<any[]>([]); // 列表数据
  const listCache = useRef<any[]>([]); // 缓存列表数据
  const [selectRowIds, setSelectRowIds] = useState<string[]>([]); // 表格选中行的ids
  const [selectRowArray, setSelectRowArray] = useState<AnyObjectType[]>([]); // 表格选中行的所有数组
  // 表格横向纵向滚动条
  const [scrollXY, setScrollXY] = useState<ScrollXYType>({
    x: undefined,
    y: 330,
  });

  // rowKey
  const key = useMemo(() => {
    if (extraProps.tableConfig && extraProps.tableConfig.rowKey) {
      return extraProps.tableConfig.rowKey as string;
    } else {
      return 'id';
    }
  }, [extraProps.tableConfig]);

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
        if (extraProps.apiMethod) {
          delete queryParams.current;
          const result = await extraProps.apiMethod(_.pickBy(queryParams, _.identity));
          let content = [];
          // 有分页数据
          if (_.isArray(result.data.content)) {
            // 显示分页
            isShowPagination.current = true;
            content = result.data.content;
            queryPagination.current.total = result.data.total;
            queryPagination.current.pages = result.data.pages;
          }
          // 无分页数据
          if (_.isArray(result.data)) {
            // 隐藏分页
            isShowPagination.current = false;
            content = result.data;
          }
          // 更新表格选中的数据id
          if (updateSelected) {
            let rowIds: string[] = [];
            let rowData: AnyObjectType[] = [];
            // 递归
            const deepTable = (list: AnyObjectType[]) => {
              if (selectRowIds.length) {
                for (let item of list) {
                  for (let ids of selectRowIds) {
                    if (item[key] === ids) {
                      rowIds.push(ids);
                      rowData.push(item);
                    }
                  }
                  if (item.children) {
                    deepTable(item.children);
                  }
                }
              }
            };
            deepTable(content);
            setSelectRowIds(rowIds);
            setSelectRowArray(rowData);
          }
          setListData(content);
          // 查询请求成功后回调
          if (extraProps.getTableSuccessData) {
            extraProps.getTableSuccessData(result);
          }
        }
      } catch (error) {}
      setListLoading(false);
    },
    [extraProps, key, selectRowIds],
  );

  /**
   * @Description 分页切换
   * @Author bihongbin
   * @Date 2020-06-24 14:05:28
   */
  const changeEstimatesList = (pagination: TablePaginationType) => {
    // 排序时，会导致分页onchange触发，值不相等时，说明分页参数变动，加载数据
    if (!_.isEqual(pagination, queryPagination.current) && isShowPagination.current) {
      queryPagination.current = {
        ...queryPagination.current,
        ...pagination,
      };
      getList({ updateSelected: false });
    }
  };

  /**
   * @Description 行选择
   * @Author bihongbin
   * @Date 2020-06-24 15:16:07
   */
  const rowSelection = useMemo(
    () => ({
      fixed: true,
      type: extraProps.rowType,
      selectedRowKeys: selectRowIds,
      getCheckboxProps: extraProps.getCheckboxProps,
      onSelectAll: (selected, selectedRows, changeRows) => {
        let ids = [...selectRowIds];
        let rows = [...selectRowArray];
        if (selected) {
          ids = _.uniq([...ids, ...changeRows.map((item) => item[key])]);
          rows = _.uniqBy([...rows, ...changeRows], [key]);
        } else {
          // 取消全选时，去掉取消选择的数据
          ids = ids.filter((item) => {
            return !changeRows.some((changeItem) => changeItem[key] === item);
          });
          rows = rows.filter((item) => {
            return !changeRows.some((changeItem) => changeItem[key] === item[key]);
          });
        }
        setSelectRowIds(ids);
        setSelectRowArray(rows);
        extraProps.onSelect && extraProps.onSelect(rows, ids);
      },
      onSelect: (record, selected) => {
        let ids = [...selectRowIds];
        let rows = [...selectRowArray];
        if (extraProps.rowType === 'checkbox') {
          if (selected) {
            ids.push(record[key]);
            rows.push(record);
          } else {
            ids = ids.filter((item) => item !== record[key]);
            rows = rows.filter((item) => item[key] !== record[key]);
          }
        }
        if (extraProps.rowType === 'radio') {
          if (selected) {
            ids = [record[key]];
            rows = [record];
          }
        }
        setSelectRowIds(ids);
        setSelectRowArray(rows);
        extraProps.onSelect && extraProps.onSelect(rows, ids);
      },
    }),
    [extraProps, key, selectRowArray, selectRowIds],
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
      // 缓存表格头拖拽以后的数据
      columnsCacheRef.current = nextColumns;
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
      const newData = extraProps.controlled === false ? listCache.current : [...listData];
      const index = newData.findIndex((item) => row[key] === item[key]);
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
      });
      if (extraProps.controlled === false) {
        listCache.current = newData; // 非受控情况下
      } else {
        setListData(newData); // 受控组件
      }
    },
    [key, listData, extraProps.controlled],
  );

  /**
   * @Description 设置表头
   * @Author bihongbin
   * @Date 2020-07-21 09:31:16
   */
  useEffect(() => {
    let columns = [...extraProps.columns];
    // 添加序号
    if (!columns.some((item) => item.dataIndex === 'sequence')) {
      columns.unshift({
        width: 55,
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
        onCell: (record: AnyObjectType, i: number) => ({
          record,
          dataIndex: col.dataIndex,
          title: col.title,
          editable: typeof col.editable === 'function' ? col.editable(record, i) : col.editable,
          inputType: col.inputType,
          valueType: col.valueType,
          valueEnum: col.valueEnum,
          recordSelectField: col.recordSelectField,
          controlRender: col.controlRender,
          formChange: col.formChange,
          remoteConfig: col.remoteConfig,
          formItemProps: col.formItemProps,
          handleSave: handleSave,
        }),
      };
      // 找到缓存中的columns，并且设置width，让其拖拽后宽度不变
      let currentColumns = columnsCacheRef.current.find(
        (t) => t.dataIndex === col.dataIndex && t.title === col.title,
      );
      if (currentColumns) {
        obj.width = currentColumns.width;
      }
      return obj;
    });
    setFormatColumns(columns);
  }, [extraProps.columns, handleSave]);

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
          if (item[key] === ids) {
            rows.push(item);
          }
        }
        if (item.children) {
          deepTable(item.children);
        }
      }
    };
    deepTable(listData);
    setSelectRowArray((prev) => {
      return _.unionBy([...prev, ...rows], key);
    });
  }, [key, listData, selectRowIds]);

  /**
   * @Description 设置静态表格数据
   * @Author bihongbin
   * @Date 2020-07-13 09:16:45
   */
  useEffect(() => {
    if (_.isArray(extraProps.data)) {
      setListData(extraProps.data || []);
    }
  }, [extraProps.data]);

  /**
   * @Description 同步列表数据缓存
   * @Author bihongbin
   * @Date 2021-11-11 09:16:45
   */
  useEffect(() => {
    listCache.current = JSON.parse(JSON.stringify(listData));
  }, [listData]);

  /**
   * @Description 固定列
   * @Author bihongbin
   * @Date 2020-06-28 10:33:20
   */
  useEffect(() => {
    const sliderMenu = document.getElementById('slider-menu');
    const routerRender = document.getElementById('router-render');

    if (extraProps.scroll?.x !== undefined || extraProps.scroll?.y !== undefined) {
      setScrollXY((prev) => ({ ...prev, ...extraProps.scroll }));
    } else {
      // 计算宽度 body.width - 左侧边栏宽度 - 右侧内容区padding*2
      if (sliderMenu && routerRender) {
        let pad = parseInt(window.getComputedStyle(routerRender, null)['paddingLeft']);
        setScrollXY((prev) => {
          prev.x = document.body.clientWidth - sliderMenu.clientWidth - (pad * 2 + 37);
          return prev;
        });
      }
    }
  }, [extraProps.scroll]);

  /**
   * @Description 分页初始查询值修改
   * @Author bihongbin
   * @Date 2021-08-24 16:06:14
   */
  useEffect(() => {
    if (extraProps.paginationConfig) {
      queryPagination.current = {
        ...queryPagination.current,
        ...extraProps.paginationConfig,
      };
    }
  }, [extraProps.paginationConfig]);

  // 暴漏给父组件调用
  useImperativeHandle<any, TableCallType>(ref, () => ({
    /** 设置loading */
    setTableLoading: (data) => {
      setListLoading(data);
    },
    /** 分页参数 */
    getPages: () => {
      return { ...queryPagination.current };
    },
    /** 调用接口获取表格数据 */
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
    /** 设置表格选中行 */
    setRowSelected: (selectedRowKeys) => {
      setSelectRowIds(selectedRowKeys);
    },
    /** 获取表格选中的id */
    getSelectIds: () => selectRowIds,
    /** 获取表格选中的数组对象 */
    getSelectRowsArray: () => selectRowArray,
    /** 移除表格选中的id和项 */
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
            if (i === item[key]) {
              bool = false;
              break;
            }
          }
          return bool;
        });
      });
    },
    /** 获取表格所有数据 */
    getStaticDataList: () => {
      if (extraProps.controlled === false) {
        return [...listCache.current];
      } else {
        return [...listData];
      }
    },
    /** 设置表格静态数据 */
    setStaticDataList: (row, callback) => {
      if (Object.prototype.toString.call(row) === '[object Object]') {
        let data = row as AnyObjectType;
        setListData(
          listData.map((item) => {
            if (item[key] === data[key]) {
              item = row;
            }
            return item;
          }),
        );
      }
      if (Object.prototype.toString.call(row) === '[object Array]') {
        setListData(row as AnyObjectType[]);
      }
      if (callback) {
        callback();
      }
    },
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
        rowSelection={extraProps.rowType ? rowSelection : undefined}
        pagination={
          _.isFunction(extraProps.apiMethod) && isShowPagination.current
            ? {
                size: 'small',
                position: ['bottomCenter'],
                showTotal: (total) => `共${total}条`,
                showSizeChanger: true,
                ...queryPagination.current,
              }
            : false
        }
        onChange={changeEstimatesList}
        scroll={scrollXY}
        {...extraProps.tableConfig}
      />
    </ConfigProvider>
  );
};

export default React.memo(forwardRef(GenerateTable), isEqualWith);
