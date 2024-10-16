// 资源警报详情组件
import React, { useMemo } from 'react';
import { Table } from 'antd';

const ResourceAlerts = ({ data, lowThreshold, highThreshold, triggerUpdate, pagination = true }) => {
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const cpuUsage = item.cpu_load;
      const memoryUsage = (item.used_memory / item.total_memory) * 100;
      const diskUsage = (item.used_disk / item.total_disk) * 100;
      
      return cpuUsage < lowThreshold || cpuUsage > highThreshold ||
             memoryUsage < lowThreshold || memoryUsage > highThreshold ||
             diskUsage < lowThreshold || diskUsage > highThreshold;
    });
  }, [data, lowThreshold, highThreshold]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      sorter: (a, b) => a.ip.localeCompare(b.ip),
    },
    {
      title: 'Cluster Name',
      dataIndex: 'cluster_name',
      key: 'cluster_name',
      sorter: (a, b) => a.cluster_name.localeCompare(b.cluster_name),
    },
    {
      title: 'CPU Usage',
      dataIndex: 'cpuUsage',
      key: 'cpuUsage',
      sorter: (a, b) => a.cpu_load - b.cpu_load,
      render: (text, record) => {
        const usage = record.cpu_load;
        return <span style={{ color: usage < lowThreshold ? 'green' : usage > highThreshold ? 'red' : 'inherit' }}>{usage.toFixed(2)}%</span>;
      },
    },
    {
      title: 'Memory Usage',
      dataIndex: 'memoryUsage',
      key: 'memoryUsage',
      sorter: (a, b) => (a.used_memory / a.total_memory) - (b.used_memory / b.total_memory),
      render: (text, record) => {
        const usage = (record.used_memory / record.total_memory) * 100;
        return <span style={{ color: usage < lowThreshold ? 'green' : usage > highThreshold ? 'red' : 'inherit' }}>{usage.toFixed(2)}%</span>;
      },
    },
    {
      title: 'Disk Usage',
      dataIndex: 'diskUsage',
      key: 'diskUsage',
      sorter: (a, b) => (a.used_disk / a.total_disk) - (b.used_disk / b.total_disk),
      render: (text, record) => {
        const usage = (record.used_disk / record.total_disk) * 100;
        return <span style={{ color: usage < lowThreshold ? 'green' : usage > highThreshold ? 'red' : 'inherit' }}>{usage.toFixed(2)}%</span>;
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={filteredData}
      rowKey={(record) => `${record.instance_id}-${record.ip}`}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['5', '20', '50', '100', '500'],
        defaultPageSize: 5,
      }}
    />
  );
}

export default ResourceAlerts;
