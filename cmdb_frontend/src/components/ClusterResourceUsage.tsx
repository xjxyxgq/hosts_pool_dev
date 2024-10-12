// 集群资源使用情况组件
import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Row, Col, Card, Table } from 'antd';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
}

interface ClusterResourceUsageProps {
  data: ClusterResource[];
}

const ClusterResourceUsage: React.FC<ClusterResourceUsageProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const renderClusterChart = (cluster: ClusterResource, index: number) => {
    const chartData = {
      labels: ['内存', '磁盘', 'CPU'],
      datasets: [
        {
          label: '平均使用率',
          data: [cluster.memory, cluster.disk, cluster.cpu],
          backgroundColor: 'rgba(136, 132, 216, 0.6)',
        },
        {
          label: '最大使用率',
          data: [cluster.maxMemory, cluster.maxDisk, cluster.maxCPU],
          backgroundColor: 'rgba(130, 202, 157, 0.6)',
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: '使用率 (%)'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: `${cluster.groupName}-${cluster.clusterName}`,
        },
      },
    };

    return (
      <Col key={`cluster-${index}`} xs={24} sm={12} md={8} lg={4} xl={4} style={{ marginBottom: '20px' }}>
        <Card style={{ height: 350 }}>
          <div style={{ height: 300 }}>
            <Bar data={chartData} options={options} />
          </div>
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
      render: (value: number) => `${value.toFixed(2)}%`,
    },
    {
      title: '内存使用率 (最大)',
      dataIndex: 'maxMemory',
      key: 'maxMemory',
      sorter: (a: ClusterResource, b: ClusterResource) => a.maxMemory - b.maxMemory,
      render: (value: number) => `${value.toFixed(2)}%`,
    },
    {
      title: '磁盘使用率 (平均)',
      dataIndex: 'disk',
      key: 'disk',
      sorter: (a: ClusterResource, b: ClusterResource) => a.disk - b.disk,
      render: (value: number) => `${value.toFixed(2)}%`,
    },
    {
      title: '磁盘使用率 (最大)',
      dataIndex: 'maxDisk',
      key: 'maxDisk',
      sorter: (a: ClusterResource, b: ClusterResource) => a.maxDisk - b.maxDisk,
      render: (value: number) => `${value.toFixed(2)}%`,
    },
    {
      title: 'CPU使用率 (平均)',
      dataIndex: 'cpu',
      key: 'cpu',
      sorter: (a: ClusterResource, b: ClusterResource) => a.cpu - b.cpu,
      render: (value: number) => `${value.toFixed(2)}%`,
    },
    {
      title: 'CPU使用率 (最大)',
      dataIndex: 'maxCPU',
      key: 'maxCPU',
      sorter: (a: ClusterResource, b: ClusterResource) => a.maxCPU - b.maxCPU,
      render: (value: number) => `${value.toFixed(2)}%`,
    },
  ];

  // 对数据进行排序
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
    <Row gutter={16}>
      <Col span={24}>
        <Row gutter={[16, 16]}>
          {currentPageData.map((cluster, index) => renderClusterChart(cluster, index))}
        </Row>
      </Col>
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
