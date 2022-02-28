/*
 * @Description 地图组件
 * @Author bihongbin
 * @Date 2020-12-03 16:34:09
 * @LastEditors bihongbin
 * @LastEditTime 2021-09-14 17:18:25
 */

import React, {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { v4 as uuidV4 } from 'uuid';
import { isEqualWith } from '../unrelated/utils';
import './index.less';

declare const BMap: any;
declare const window: Window & { onMapInit?: () => void };

interface PropType {
  /** className */
  className?: string;
  /** style内联样式 */
  style?: React.CSSProperties;
  /** 关键字选中回调 */
  onChange?: (data: MapType) => void;
}

export type positionType = [number, number];

export interface MapCallType {
  setMapCenter: (data: positionType, zoom?: number) => void;
}

export interface MapType {
  address?: string;
  // 必要属性
  location: {
    lat: number;
    lng: number;
  };
}

/** 高德地图组件 */
const GaoDeMap = (props: PropType, ref: any) => {
  const mapRef = useRef<any>(null);
  const mapCenterLocRef = useRef<any>(null);

  /**
   * @Description 缓存生成的随机容器id
   * @Author bihongbin
   * @Date 2020-12-03 15:36:38
   */
  const uid = useMemo(() => uuidV4(), []);

  /**
   * @Description 缓存随机生成的搜索id
   * @Author bihongbin
   * @Date 2021-09-08 15:02:19
   */
  const suggestId = useMemo(() => uuidV4(), []);

  /**
   * @Description 百度和谷歌坐标相互转换
   * @Author bihongbin
   * @Date 2021-09-14 14:59:15
   */
  const coordinateConversion = (data: {
    point: any;
    target: 'baidu' | 'google';
    callback?: (data: { lat: number; lng: number }) => void;
  }) => {
    const COORDINATES_GCJ02 = 3; // GCJ02坐标
    const COORDINATES_BD09 = 5; // 百度bd09经纬度坐标
    let forward = 0;
    let rear = 0;
    const convertor = new BMap.Convertor();
    const pointArr = [];
    pointArr.push(data.point);
    // 谷歌转百度
    if (data.target === 'baidu') {
      forward = COORDINATES_GCJ02;
      rear = COORDINATES_BD09;
    }
    // 百度转谷歌
    if (data.target === 'google') {
      forward = COORDINATES_BD09;
      rear = COORDINATES_GCJ02;
    }
    convertor.translate(pointArr, forward, rear, (d: any) => {
      if (d.status === 0) {
        if (data.callback) {
          data.callback(d.points[0]);
        }
      }
    });
  };

  /**
   * @Description 创建添加覆盖物
   * @Author bihongbin
   * @Date 2021-09-09 10:01:42
   */
  const addMark = (point: any) => {
    mapRef.current.addOverlay(
      new BMap.Marker(point, {
        icon: new BMap.Icon(
          'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
          new BMap.Size(20, 32),
        ),
      }),
    );
  };

  /**
   * @Description 设置地图中心位置和层级
   * @Author bihongbin
   * @Date 2020-12-04 09:57:32
   */
  const setMapCenterLocation = useCallback((location: positionType, zoom?: number) => {
    if (mapRef.current) {
      // 坐标系
      const point = new BMap.Point(location[0], location[1]);
      // 添加覆盖物
      addMark(point);
      // 设置中心点和层级
      mapRef.current.centerAndZoom(point, zoom ? zoom : 18);
    } else {
      // 当地图实例不存在，记忆中心点和坐标
      mapCenterLocRef.current = {
        location,
        zoom,
      };
    }
  }, []);

  /**
   * @Description 设置地图选中地址以后的onChange回调
   * @Author bihongbin
   * @Date 2021-09-08 17:04:22
   */
  const setPropsOnChange = useCallback(
    (data: MapType) => {
      console.log('转换为google坐标前：', data.location);
      const point = new BMap.Point(data.location.lng, data.location.lat);
      // 转换为google坐标
      coordinateConversion({
        target: 'google',
        point,
        callback: (d) => {
          data.location.lng = d.lng;
          data.location.lat = d.lat;
          console.log('转换为google坐标后：', data.location);
          if (props.onChange) {
            props.onChange(data);
          }
        },
      });
    },
    [props],
  );

  /**
   * @Description 智能搜索设置地址
   * @Author bihongbin
   * @Date 2021-09-08 15:26:45
   * @param {*} useCallback
   */
  const setPlace = useCallback(
    (value: string) => {
      // 清除地图覆盖物
      mapRef.current.clearOverlays();
      // 智能搜索
      const local = new BMap.LocalSearch(mapRef.current, {
        onSearchComplete: () => {
          // 获取第一个智能搜索的结果
          let pp = local.getResults().getPoi(0);
          if (pp) {
            const point = pp.point;
            setMapCenterLocation([point.lng, point.lat]);
            setPropsOnChange({
              ...pp,
              location: {
                lng: point.lng,
                lat: point.lat,
              },
            });
          }
        },
      });
      local.search(value);
    },
    [setMapCenterLocation, setPropsOnChange],
  );

  /**
   * @Description 加载地图文件
   * @Author bihongbin
   * @Date 2020-12-03 15:44:04
   */
  useEffect(() => {
    const loadMap = () => {
      mapRef.current = new BMap.Map(uid, { enableMapClick: false });
      mapRef.current.enableScrollWheelZoom(true);

      // 注册关键字查询事件
      const ac = new BMap.Autocomplete({
        input: suggestId,
        location: mapRef.current,
      });

      // 关键字查询结果下拉列表点击事件
      ac.addEventListener('onconfirm', (e) => {
        const { province, city, district, street, business } = e.item.value;
        setPlace(province + city + district + street + business);
      });

      // 地图点击事件
      mapRef.current.addEventListener('click', (e) => {
        // 清除地图覆盖物
        mapRef.current.clearOverlays();
        // 添加覆盖物
        addMark(new BMap.Point(e.point.lng, e.point.lat));
        setPropsOnChange({
          location: {
            lng: e.point.lng,
            lat: e.point.lat,
          },
        });
      });

      if (mapCenterLocRef.current) {
        // 使用记忆的中心点和坐标
        setMapCenterLocation(mapCenterLocRef.current.location, mapCenterLocRef.current.zoom);
      } else {
        // 默认中国北京市天安门坐标
        setMapCenterLocation([116.404, 39.915]);
      }
    };
    if (document.getElementById('lbs')) {
      loadMap();
    } else {
      window.onMapInit = function () {
        loadMap();
      };
      let url =
        'https://api.map.baidu.com/api?v=3.0&ak=1IzhwXLOwlEnencZUoSnMkSkMVADfT3s&callback=onMapInit';
      let jsApi = document.createElement('script');
      jsApi.src = url;
      jsApi.id = 'lbs';
      document.head.appendChild(jsApi);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  /**
   * @Description 暴露方法给父组件使用
   * @Author bihongbin
   * @Date 2020-12-04 10:02:19
   */
  useImperativeHandle<any, MapCallType>(ref, () => ({
    // 根据经纬度设置地图中心点 data=[longitude, latitude]
    setMapCenter: (data, zoom) => {
      console.log('转换为百度坐标前：', {
        lng: data[0],
        lat: data[1],
      });
      const point = new BMap.Point(data[0], data[1]);
      // 转换为百度坐标
      coordinateConversion({
        target: 'baidu',
        point,
        callback: (d) => {
          console.log('转换为百度坐标后：', {
            lng: d.lng,
            lat: d.lat,
          });
          setMapCenterLocation([d.lng, d.lat], zoom);
        },
      });
    },
  }));

  return (
    <div className={`gaoDe-container ${props.className}`}>
      <div id={uid} style={props.style ? props.style : { width: '100%', height: 365 }} />
      <div className="input-item-prepend">
        <span className="ant-input-group-wrapper">
          <span className="ant-input-wrapper ant-input-group">
            <span className="ant-input-group-addon">关键字</span>
            <span className="ant-input-affix-wrapper">
              <input id={suggestId} className="ant-input" type="text" placeholder="请输入关键字" />
            </span>
          </span>
        </span>
      </div>
    </div>
  );
};

export default React.memo(forwardRef(GaoDeMap), isEqualWith);
