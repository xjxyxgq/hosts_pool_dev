// 主机资源池列表页
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Table, Input, Select, Button } from 'antd';
import HostDetail from './HostDetail';

const { Option } = Select;

const getIDCNameFromIP = (ip) => {
  const parts = ip.split('.');
  if (parts.length >= 2) {
    switch (parts[1]) {
      case '1': return 'P1';
      case '2': return 'P2';
      case '3': return 'P3';
      case '4': return 'P4';
      case '5': return 'P5';
      case '6': return 'P6';
      default: return 'Unknown-IDC';
    }
  }
  return 'Unknown-IDC';
};

const HostList = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
  const [hosts, setHosts] = useState([]);
  const [filteredHosts, setFilteredHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ipFilter, setIpFilter] = useState('');
  const [datacenterFilter, setDatacenterFilter] = useState([]);
  const [appTypeFilter, setAppTypeFilter] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState([]);
  const [selectedHost, setSelectedHost] = useState(null);
  const [isCustomModalVisible, setIsCustomModalVisible] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`${backendUrl}/api/cmdb/v1/get_hosts_pool_detail`)
      .then(response => {
        setHosts(response.data);
        setFilteredHosts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching hosts:', error);
        setError('Failed to fetch hosts data');
        setLoading(false);
      });
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = hosts;

    if (ipFilter) {
      filtered = filtered.filter(host => host.host_ip.includes(ipFilter));
    }

    if (datacenterFilter.length > 0) {
      filtered = filtered.filter(host => {
        const idcName = getIDCNameFromIP(host.host_ip);
        return datacenterFilter.includes(idcName);
      });
    }

    if (appTypeFilter.length > 0) {
      filtered = filtered.filter(host => 
        host.host_applications.some(app => appTypeFilter.includes(app.server_type))
      );
    }

    if (departmentFilter.length > 0) {
      filtered = filtered.filter(host => 
        host.host_applications.some(app => departmentFilter.includes(app.department_name))
      );
    }

    setFilteredHosts(filtered);
  }, [hosts, ipFilter, datacenterFilter, appTypeFilter, departmentFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const showHostDetail = (host) => {
    setSelectedHost(host);
    setIsCustomModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsCustomModalVisible(false);
  };

  const columns = [
    {
      title: '主机名',
      dataIndex: 'host_name',
      key: 'host_name',
      sorter: (a, b) => a.host_name.localeCompare(b.host_name),
      render: (text, record) => (
        <Button type="link" onClick={() => showHostDetail(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'host_ip',
      key: 'host_ip',
      sorter: (a, b) => a.host_ip.localeCompare(b.host_ip),
    },
    {
      title: 'CPU核数',
      dataIndex: 'vcpus',
      key: 'vcpus',
      sorter: (a, b) => a.vcpus - b.vcpus,
    },
    {
      title: '内存大小(GB)',
      dataIndex: 'ram',
      key: 'ram',
      sorter: (a, b) => a.ram - b.ram,
    },
    {
      title: '硬盘空间(GB)',
      dataIndex: 'disk_size',
      key: 'disk_size',
      sorter: (a, b) => a.disk_size - b.disk_size,
    },
    {
      title: '主机类型',
      dataIndex: 'host_type',
      key: 'host_type',
      sorter: (a, b) => a.host_type.localeCompare(b.host_type),
      render: (text) => text === '0' ? '云主机' : '裸金属',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="IP地址"
          value={ipFilter}
          onChange={(e) => setIpFilter(e.target.value)}
          style={{ width: 200, marginRight: 8 }}
        />
        <Select
          placeholder="选择机房"
          mode="multiple"
          value={datacenterFilter}
          onChange={(value) => setDatacenterFilter(value)}
          style={{ width: 200, marginRight: 8 }}
        >
          <Option value="P1">P1</Option>
          <Option value="P2">P2</Option>
          <Option value="P3">P3</Option>
          <Option value="P4">P4</Option>
          <Option value="P5">P5</Option>
          <Option value="P6">P6</Option>
        </Select>
        <Select
          placeholder="应用类型"
          mode="multiple"
          value={appTypeFilter}
          onChange={(value) => setAppTypeFilter(value)}
          style={{ width: 200, marginRight: 8 }}
        >
          {Array.from(new Set(hosts.flatMap(host => 
            host.host_applications ? host.host_applications.map((app) => app.server_type) : []
          ))).map((type) => (
            <Option key={type} value={type}>{type}</Option>
          ))}
        </Select>
        <Select
          placeholder="所属部门"
          mode="multiple"
          value={departmentFilter}
          onChange={(value) => setDepartmentFilter(value)}
          style={{ width: 200, marginRight: 8 }}
        >
          {Array.from(new Set(hosts.flatMap(host => 
            host.host_applications ? host.host_applications.map((app) => app.department_name) : []
          ))).map((dept) => (
            <Option key={dept} value={dept}>{dept}</Option>
          ))}
        </Select>
        <Button onClick={() => {
          setIpFilter('');
          setDatacenterFilter([]);
          setAppTypeFilter([]);
          setDepartmentFilter([]);
        }}>重置</Button>
      </div>
      <Table
        columns={columns}
        dataSource={filteredHosts}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '50', '100', '500'],
          defaultPageSize: 10,
        }}
      />
      {isCustomModalVisible && (
        <div className="custom-modal" onClick={handleCloseModal}>
          <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <h2>主机详情</h2>
            {selectedHost ? <HostDetail host={selectedHost} /> : <div>Loading...</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default HostList;