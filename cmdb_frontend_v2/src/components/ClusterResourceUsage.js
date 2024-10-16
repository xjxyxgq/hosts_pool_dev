// 集群资源使用情况组件
import React, { useState } from 'react';
import { Row, Col, Card, Table } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ClusterResourceUsage = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const renderClusterChart = (cluster) => {
    const roundToTwoDecimals = (value) => Math.round(value * 100) / 100;

    const chartData = [
      { 
        name: 'CPU', 
        平均: roundToTwoDecimals(cluster.cpu),
        最大: roundToTwoDecimals(cluster.maxCPU),
        最小: roundToTwoDecimals(cluster.minCPU)
      },
      { 
        name: '内存', 
        平均: roundToTwoDecimals(cluster.memory),
        最大: roundToTwoDecimals(cluster.maxMemory),
        最小: roundToTwoDecimals(cluster.minMemory)
      },
      { 
        name: '磁盘', 
        平均: roundToTwoDecimals(cluster.disk),
        最大: roundToTwoDecimals(cluster.maxDisk),
        最小: roundToTwoDecimals(cluster.minDisk)
      },
    ];

    return (
      <Col xs={24} sm={12} md={8} lg={6} xl={4} xxl={4} style={{ marginBottom: '20px' }}>
        <Card title={`${cluster.groupName}-${cluster.clusterName}`} style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="平均" fill="#8884d8" name="平均使用率 (%)" />
              <Bar dataKey="最大" fill="#82ca9d" name="最大使用率 (%)" />
              <Bar dataKey="最小" fill="#ffc658" name="最小使用率 (%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Col>
    );
  };

  const columns = [
    {
      title: '集群名称',
      dataIndex: 'clusterName',
      key: 'clusterName',
      sorter: (a, b) => a.clusterName.localeCompare(b.clusterName),
    },
    {
      title: '组名',
      dataIndex: 'groupName',
      key: 'groupName',
      sorter: (a, b) => a.groupName.localeCompare(b.groupName),
    },
    {
      title: '内存使用率 (平均)',
      dataIndex: 'memory',
      key: 'memory',
      sorter: (a, b) => a.memory - b.memory,
      render: (value) => `${Math.round(value * 100) / 100}%`,
    },
    {
      title: '内存使用率 (最大)',
      dataIndex: 'maxMemory',
      key: 'maxMemory',
      sorter: (a, b) => a.maxMemory - b.maxMemory,
      render: (value) => `${Math.round(value * 100) / 100}%`,
    },
    {
      title: '磁盘使用率 (平均)',
      dataIndex: 'disk',
      key: 'disk',
      sorter: (a, b) => a.disk - b.disk,
      render: (value) => `${Math.round(value * 100) / 100}%`,
    },
    {
      title: '磁盘使用率 (最大)',
      dataIndex: 'maxDisk',
      key: 'maxDisk',
      sorter: (a, b) => a.maxDisk - b.maxDisk,
      render: (value) => `${Math.round(value * 100) / 100}%`,
    },
    {
      title: 'CPU使用率 (平均)',
      dataIndex: 'cpu',
      key: 'cpu',
      sorter: (a, b) => a.cpu - b.cpu,
      render: (value) => `${Math.round(value * 100) / 100}%`,
    },
    {
      title: 'CPU使用率 (最大)',
      dataIndex: 'maxCPU',
      key: 'maxCPU',
      sorter: (a, b) => a.maxCPU - b.maxCPU,
      render: (value) => `${Math.round(value * 100) / 100}%`,
    },
  ];

  const sortedData = [...data].sort((a, b) => {
    const aKey = `${a.groupName}-${a.clusterName}`;
    const bKey = `${b.groupName}-${b.clusterName}`;
    return aKey.localeCompare(bKey);
  });

  const currentPageData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <Row gutter={[16, 16]}>
      {currentPageData.map((cluster, index) => renderClusterChart(cluster))}
      <Col span={24}>
        <Table
          columns={columns}
          dataSource={sortedData}
          rowKey={(record) => `${record.groupName}-${record.clusterName}`}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: sortedData.length,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize || 5);
            },
          }}
          onChange={handleTableChange}
        />
      </Col>
    </Row>
  );
};

export default ClusterResourceUsage;