// 集群资源使用情况组件
import React, { useState } from 'react';
import { Row, Col, Card, Table } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface ClusterResource {
  clusterName: string;
  groupName: string;
  memory: number;
  memoryTotal: number;
  memoryUsed: number;
  disk: number;
  diskTotal: number;
  diskUsed: number;
  cpu: number;
  cpuTotal: number;
  cpuUsed: number;
  count: number;
  maxMemory: number;
  maxDisk: number;
  maxCPU: number;
  minMemory: number;
  minDisk: number;
  minCPU: number;
}

interface ClusterResourceUsageProps {
  data: ClusterResource[];
}

const ClusterResourceUsage: React.FC<ClusterResourceUsageProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const renderClusterChart = (cluster: ClusterResource) => {
    const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100;

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
      sorter: (a: ClusterResource, b: ClusterResource) => a.clusterName.localeCompare(b.clusterName),
    },
    {
      title: '组名',
      dataIndex: 'groupName',
      key: 'groupName',
      sorter: (a: ClusterResource, b: ClusterResource) => a.groupName.localeCompare(b.groupName),
    },
    {
      title: '内存使用率 (平均)',
      dataIndex: 'memory',
      key: 'memory',
      sorter: (a: ClusterResource, b: ClusterResource) => a.memory - b.memory,
      render: (value: number) => `${Math.round(value * 100) / 100}%`,
    },
    {
      title: '内存使用率 (最大)',
      dataIndex: 'maxMemory',
      key: 'maxMemory',
      sorter: (a: ClusterResource, b: ClusterResource) => a.maxMemory - b.maxMemory,
      render: (value: number) => `${Math.round(value * 100) / 100}%`,
    },
    {
      title: '磁盘使用率 (平均)',
      dataIndex: 'disk',
      key: 'disk',
      sorter: (a: ClusterResource, b: ClusterResource) => a.disk - b.disk,
      render: (value: number) => `${Math.round(value * 100) / 100}%`,
    },
    {
      title: '磁盘使用率 (最大)',
      dataIndex: 'maxDisk',
      key: 'maxDisk',
      sorter: (a: ClusterResource, b: ClusterResource) => a.maxDisk - b.maxDisk,
      render: (value: number) => `${Math.round(value * 100) / 100}%`,
    },
    {
      title: 'CPU使用率 (平均)',
      dataIndex: 'cpu',
      key: 'cpu',
      sorter: (a: ClusterResource, b: ClusterResource) => a.cpu - b.cpu,
      render: (value: number) => `${Math.round(value * 100) / 100}%`,
    },
    {
      title: 'CPU使用率 (最大)',
      dataIndex: 'maxCPU',
      key: 'maxCPU',
      sorter: (a: ClusterResource, b: ClusterResource) => a.maxCPU - b.maxCPU,
      render: (value: number) => `${Math.round(value * 100) / 100}%`,
    },
  ];

  // 对数据行排序
  const sortedData = [...data].sort((a, b) => {
    const aKey = `${a.groupName}-${a.clusterName}`;
    const bKey = `${b.groupName}-${b.clusterName}`;
    return aKey.localeCompare(bKey);
  });

  // 计算当前页的数据
  const currentPageData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleTableChange = (pagination: any) => {
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
