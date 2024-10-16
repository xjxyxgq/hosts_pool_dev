// 磁盘空间预测组件
import React from 'react';
import { Table } from 'antd';

const DiskFullPrediction = ({ data, pagination = true }) => {
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
      title: 'Current Disk Usage',
      dataIndex: 'diskUsage',
      key: 'diskUsage',
      sorter: (a, b) => (a.used_disk / a.total_disk) - (b.used_disk / b.total_disk),
      render: (text, record) => `${((record.used_disk / record.total_disk) * 100).toFixed(2)}%`,
    },
    {
      title: 'Predicted Full Date',
      dataIndex: 'predictedFullDate',
      key: 'predictedFullDate',
      sorter: (a, b) => {
        const getFullDate = (record) => {
          const usageRate = (record.used_disk / record.total_disk) / 30;
          const daysUntilFull = (1 - (record.used_disk / record.total_disk)) / usageRate;
          return new Date(new Date().getTime() + daysUntilFull * 24 * 60 * 60 * 1000);
        };
        return getFullDate(a).getTime() - getFullDate(b).getTime();
      },
      render: (text, record) => {
        const usageRate = (record.used_disk / record.total_disk) / 30;
        const daysUntilFull = (1 - (record.used_disk / record.total_disk)) / usageRate;
        const fullDate = new Date(new Date().getTime() + daysUntilFull * 24 * 60 * 60 * 1000);
        return fullDate.toLocaleDateString();
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
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

export default DiskFullPrediction;