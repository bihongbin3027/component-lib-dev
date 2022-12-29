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
import { TableRowSelection } from 'antd/es/table/interface';
import update from 'immutability-helper';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ConfigProvider from '../unrelated/ConfigProvider';
import ResizableTitle from './ResizableTitle';
import EditableCell, { EditableRow, EditableColumnsType } from './EditableCell';
import { AnyObjectType, PromiseAxiosResultType } from '../unrelated/typings';
import { isEqualWith } from '../unrelated/utils';
import useSetState from '../unrelated/hooks/useSetState';
import './index.less';

// 导出表格头类型
export type TableColumns<T = AnyObjectType> = ColumnType<T> & Partial<EditableColumnsType>;

export interface getTableListQueryType {
  /** 分页值 */
  current?: number;
  /** 是否清空选中项(ids和rows) */
  clearSelectIds?: boolean;
  /** 传此参数不重置分页 */
  pagination?: 'not-reset';
  [key: string]: any;
}

// 导出该组件可调用的方法类型
export interface TableCallType {
  // 设置加载loading
  setTableLoading: (data: boolean) => void;
  /** 调用接口手动加载数据 */
  getTableList: (values?: getTableListQueryType, callBack?: () => void) => void;
  /** 获取分页数据 */
  getPages: () => TablePaginationType | undefined;
  /** 设置选中，当设置original=true时，不会重置selectRowIds，会在原有的selectRowIds扩展 */
  setRowSelected: (selectedRowKeys: any[], original?: true) => void;
  /** 获取选中id */
  getSelectIds: () => any[];
  /** 清空选中 */
  clearSelectIds: () => void;
  /** 获取选中的数据项 */
  getSelectRowsArray: () => AnyObjectType[];
  /** 删除选中id */
  removeSelectIds: (data: string[]) => void;
  /** 获取表格静态数据 */
  getStaticDataList: () => AnyObjectType[];
  /** 设置表格静态数据 */
  setStaticDataList: (row: AnyObjectType | AnyObjectType[], callback?: () => void) => void;
}

export type ScrollXYType = {
  x?: string | number | true | undefined;
  y?: string | number | undefined;
};

// 组件传参配置
export interface GenerateTableProp {
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
    columns: TableColumns<AnyObjectType>[];
    /** 静态表格数据 */
    data?: AnyObjectType[];
    /** 表格数据编辑是否是受控组件 默认是 */
    controlled?: boolean;
    /** 列拖动功能 */
    drag?: {
      /** 打开与关闭 */
      open: boolean;
      /** 拖动回调 */
      moveRow: (
        /** 目标终点位置 */
        dragIndex: number,
        /** 目标开始位置 */
        hoverIndex: number,
        /** 拖拽完成后数据 */
        data: AnyObjectType[],
        /** 原数据 */
        prevData: AnyObjectType[],
        /** 拖拽范围数据 */
        range: AnyObjectType[],
      ) => Promise<boolean> | void;
    };
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

type TablePaginationType = TablePaginationConfig & { pages: number; [key: string]: any };

interface StateType {
  /** 表格选中行的key */
  selectRowIds: string[];
  /** 表格选中的所有数组 */
  selectRowArray: AnyObjectType[];
}

const GenerateTable = (props: GenerateTableProp, ref: any) => {
  // 父级props
  const extraProps = useMemo<GenerateTableProp['extra']>(() => {
    const extra = (props.extra || {}) as GenerateTableProp['extra'];

    return {
      tableConfig: extra.tableConfig,
      rowType: extra.rowType,
      scroll: extra.scroll,
      apiMethod: extra.apiMethod,
      columns: extra.columns || [],
      data: extra.data,
      controlled: extra.controlled,
      drag: extra.drag,
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
    orderByInfo: undefined, // 排序 1升序 -1降序
  });
  const columnsCacheRef = useRef<any[]>([]); // 缓存表格头拖拽以后的数据
  const listCache = useRef<any[]>([]); // 缓存列表数据
  const [formatColumns, setFormatColumns] = useState<any[]>(extraProps.columns); // 表格头
  const [listLoading, setListLoading] = useState(false); // 列表loading
  const [listData, setListData] = useState<any[]>([]); // 列表数据
  const [state, setState] = useSetState<StateType>({
    selectRowIds: [],
    selectRowArray: [],
  });
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
        if (values.pagination === 'not-reset') {
          delete values.pagination;
        }
        queryParameters.current = {
          ...queryParameters.current,
          ...values,
        };
      }
      try {
        const queryParams: AnyObjectType = {
          ...queryParameters.current,
        };
        for (let item in queryPagination.current) {
          const itemValue = queryPagination.current[item];
          // 排序
          if (item === 'orderByInfo') {
            queryParams.orderByInfo = itemValue;
          }
          // 当前页
          if (item === 'current') {
            queryParams.page = itemValue;
          }
          // 当前条数
          if (item === 'pageSize') {
            queryParams.size = queryParams.size || itemValue;
          }
        }
        // 查询时，分页重置到第一页
        if (values && values.current) {
          queryParams.page = values.current;
          queryPagination.current.current = values.current;
        }
        if (extraProps.apiMethod) {
          delete queryParams.current;
          const result = await extraProps.apiMethod(_.pickBy(queryParams, _.identity));
          let content: AnyObjectType[] = [];
          // 有分页数据
          if (_.isArray(result.data.content)) {
            if (extraProps.paginationConfig !== false) {
              // 显示分页
              isShowPagination.current = true;
            } else {
              // 隐藏分页
              isShowPagination.current = false;
            }
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
            setState((prev) => {
              let rowIds: string[] = [...prev.selectRowIds];
              let rowData: AnyObjectType[] = [...prev.selectRowArray];
              // 递归
              const deepTable = (list: AnyObjectType[]) => {
                if (prev.selectRowIds.length) {
                  for (let item of list) {
                    for (let ids of prev.selectRowIds) {
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
              prev.selectRowIds = _.unionBy(rowIds);
              prev.selectRowArray = _.unionBy(rowData, key);
              return prev;
            });
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
    [extraProps, key, setState],
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
      // getList({ updateSelected: false });
      getList();
    }
  };

  /**
   * @Description 行选择
   * @Author bihongbin
   * @Date 2020-06-24 15:16:07
   */
  const rowSelection = useMemo<TableRowSelection<any>>(
    () => ({
      fixed: true,
      type: extraProps.rowType,
      selectedRowKeys: state.selectRowIds,
      getCheckboxProps: extraProps.getCheckboxProps,
      onSelectAll: (selected, selectedRows, changeRows) => {
        setState((prev) => {
          let ids = [...prev.selectRowIds];
          let rows = [...prev.selectRowArray];

          if (selected) {
            ids = _.uniq([...ids, ...changeRows.map((item) => item[key])]);
            rows = _.uniqBy([...rows, ...changeRows], key);
          } else {
            // 取消全选时，去掉取消选择的数据
            ids = ids.filter((item) => {
              return !changeRows.some((changeItem) => changeItem[key] === item);
            });
            rows = rows.filter((item) => {
              return !changeRows.some((changeItem) => changeItem[key] === item[key]);
            });
          }
          extraProps.onSelect && extraProps.onSelect(rows, ids);

          prev.selectRowIds = ids;
          prev.selectRowArray = rows;
          return prev;
        });
      },
      onSelect: (record, selected) => {
        setState((prev) => {
          let ids = [...prev.selectRowIds];
          let rows = [...prev.selectRowArray];

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
          extraProps.onSelect && extraProps.onSelect(rows, ids);

          prev.selectRowIds = ids;
          prev.selectRowArray = rows;
          return prev;
        });
      },
    }),
    [extraProps, key, setState, state.selectRowIds],
  );

  /**
   * @Description 表头拖动重置宽度
   * @Author bihongbin
   * @Date 2020-07-21 10:36:35
   */
  const handleResize =
    (index: number) =>
    (e: any, { size }: any) => {
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
   * @Description 列拖动功能
   * @Author bihongbin
   * @Date 2020-12-14 11:54:23
   */
  const moveRow = useCallback(
    async (dragIndex: number, hoverIndex: number) => {
      const dragRow = listData[dragIndex];
      const list = update(listData, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragRow],
        ],
      });

      setListLoading(true);
      try {
        // 拖动列回调
        if (extraProps.drag) {
          const data = JSON.parse(JSON.stringify(list));
          const prevData = JSON.parse(JSON.stringify(listData));
          const i = [dragIndex, hoverIndex].sort();

          const res = await extraProps.drag.moveRow(
            dragIndex, // 目标终点位置
            hoverIndex, // 目标开始位置
            data, // 拖拽完成后数据
            prevData, // 原数据
            data.slice(i[0], i[1] + 1), // 拖拽范围数据
          );
          // 只有在false情况下才不允许拖动列
          if (res !== false) {
            setListData(data);
          }
        }
      } finally {
        setListLoading(false);
      }
    },
    [extraProps.drag, listData],
  );

  /**
   * @Description 设置表头
   * @Author bihongbin
   * @Date 2020-07-21 09:31:16
   */
  useEffect(() => {
    const formatColumns = async () => {
      let columns = [...extraProps.columns];

      // 添加序号
      if (!columns.some((item) => item.dataIndex === 'sequence')) {
        columns.unshift({
          width: 55,
          fixed: 'left',
          title: '序号',
          dataIndex: 'sequence',
          render: (text: any, record: any, index: number) => {
            const pages = queryPagination.current;
            if (Object.keys(pages).length) {
              return ((pages.current || 0) - 1) * (pages.pageSize || 0) + index + 1;
            } else {
              return index + 1;
            }
          },
        });
      }

      for (let [index, col] of columns.entries()) {
        // 默认自己查询remoteConfig.remoteApi
        if (col.valueType === 'RemoteSearch') {
          if (col.remoteConfig && col.remoteConfig.remoteApi) {
            // @ts-ignore
            col.valueEnum = await col.remoteConfig.remoteApi();
          }
        }

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

        columns[index] = obj;
      }

      setFormatColumns(columns);
    };

    formatColumns();
  }, [extraProps.columns, handleSave]);

  /**
   * @Description 更新表格行选中的数据
   * @Author bihongbin
   * @Date 2020-10-29 17:37:10
   */
  useEffect(() => {
    setState((prev) => {
      let rows: AnyObjectType[] = [];
      // 递归
      const deepTable = (list: AnyObjectType[]) => {
        for (let item of list) {
          for (let ids of state.selectRowIds) {
            if (item[key] === ids) {
              rows.push(item);
            }
          }
          if (item.children) {
            deepTable(item.children);
          }
        }
      };
      if (state.selectRowIds.length) {
        deepTable(listData);
        rows = _.unionBy([...prev.selectRowArray, ...rows], key);
      }
      prev.selectRowArray = rows;
      return prev;
    });
  }, [key, listData, setState, state.selectRowIds]);

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
          prev.x = document.body.clientWidth - sliderMenu.clientWidth - (pad * 2 + 43);
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
      if (values) {
        // 分页是否重置
        if (values.pagination === 'not-reset') {
          values.current = queryPagination.current.current;
        } else {
          if (values.current === undefined) {
            values.current = 1;
          }
        }

        // 清空选中项
        if (values.clearSelectIds) {
          delete values.clearSelectIds;
          setState((prev) => {
            prev.selectRowArray = [];
            prev.selectRowIds = [];
            return prev;
          });
        }
      }
      await getList(values);
      // 查询回调
      if (callback) {
        callback();
      }
    },
    /** 设置表格选中行 */
    setRowSelected: (selectedRowKeys, original) => {
      let ids = selectedRowKeys;
      if (original === true) {
        // set 合并去重
        ids = Array.from(new Set([...state.selectRowIds, ...selectedRowKeys]));
      }
      setState({
        selectRowIds: ids,
      });
    },
    /** 获取表格选中的id */
    getSelectIds: () => state.selectRowIds,
    /** 清空表格选中 */
    clearSelectIds: () => {
      setState({
        selectRowIds: [],
        selectRowArray: [],
      });
    },
    /** 获取表格选中的数组对象 */
    getSelectRowsArray: () => state.selectRowArray,
    /** 移除表格选中的id和项 */
    removeSelectIds: (data) => {
      setState({
        selectRowIds: state.selectRowIds.filter((item) => {
          let bool = true;
          for (let i of data) {
            if (i === item) {
              bool = false;
              break;
            }
          }
          return bool;
        }),
        selectRowArray: state.selectRowArray.filter((item) => {
          let bool = true;
          for (let i of data) {
            if (i === item[key]) {
              bool = false;
              break;
            }
          }
          return bool;
        }),
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
      <DndProvider backend={HTML5Backend}>
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
          onRow={(_, index) => {
            const attr = {
              index,
              moveRow,
              open: extraProps.drag && extraProps.drag.open,
            };
            return attr as React.HTMLAttributes<any>;
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
                  showQuickJumper: true,
                  ...queryPagination.current,
                }
              : false
          }
          onChange={(pagination: any, filter, sorter: any) => {
            const { order } = sorter;

            // 1升序 -1降序
            pagination['orderByInfo'] = undefined;
            if (order) {
              pagination['orderByInfo'] = `${sorter.field}:${order === 'ascend' ? 1 : -1}`;
            }

            changeEstimatesList(pagination as TablePaginationType);
          }}
          scroll={scrollXY}
          {...extraProps.tableConfig}
        />
      </DndProvider>
    </ConfigProvider>
  );
};

/** 表格组件 */
export default React.memo(forwardRef(GenerateTable), isEqualWith);
