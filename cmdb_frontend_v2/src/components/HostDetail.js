// 主机资源池详情页（弹出）
import React from 'react';
import { Descriptions } from 'antd';

const HostDetail = ({ host }) => {
  const formatValue = (key, value) => {
    if (key === 'host_type') {
      return value === '0' ? 'Cloud Host' : 'Bare Metal';
    }
    if (key === 'is_deleted' || key === 'is_static') {
      return value ? 'Yes' : 'No';
    }
    if (key === 'create_time' || key === 'update_time') {
      return new Date(value).toLocaleString();
    }
    return value?.toString() || 'N/A';
  };

  return (
    <>
      <Descriptions title="Host Details" bordered column={3}>
        {Object.entries(host).map(([key, value]) => {
          if (key !== 'host_applications') {
            return (
              <Descriptions.Item key={`host-${key}`} label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}>
                {formatValue(key, value)}
              </Descriptions.Item>
            );
          }
          return null;
        })}
      </Descriptions>
      
      <h3 style={{ marginTop: '20px' }}>Host Applications</h3>
      {host.host_applications.map((app, index) => (
        <Descriptions key={`app-${app.id || index}`} title={`Application ${index + 1}`} bordered column={2} style={{ marginTop: '10px' }}>
          {Object.entries(app).map(([key, value]) => (
            <Descriptions.Item key={`app-${app.id || index}-${key}`} label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}>
              {formatValue(key, value)}
            </Descriptions.Item>
          ))}
        </Descriptions>
      ))}
    </>
  );
};

export default HostDetail;