import React from 'react';
import { Alert } from 'antd';

// 移除 TypeScript 类型注解
const Alerts = ({ message, type }) => {
  return <Alert message={message} type={type} />;
};

export default Alerts;
