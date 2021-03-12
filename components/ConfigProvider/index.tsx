import React from 'react';
import { ConfigProvider as ConfigProviderAntd } from 'antd';
import 'moment/locale/zh-cn';
import zhCN from 'antd/lib/locale/zh_CN';
import moment from 'moment';

interface PropTypes {
  children: React.ReactNode;
}

moment.locale('zh-cn', {
  weekdaysMin: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
});

const ConfigProvider = (props: PropTypes) => {
  return <ConfigProviderAntd locale={zhCN}>{props.children}</ConfigProviderAntd>;
};

export default ConfigProvider;
