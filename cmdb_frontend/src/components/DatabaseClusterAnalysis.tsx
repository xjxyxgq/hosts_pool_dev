// 主机资源用量分析页
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Select, Layout, Card, Row, Col, Input, Button, message, DatePicker, ConfigProvider } from 'antd';
import axios from 'axios';
import html2canvas from 'html2canvas';
import Alerts from './Alerts';
import ClusterResourceUsage, { ClusterResource } from './ClusterResourceUsage';
import ResourceAlerts from './ResourceAlerts';
import DiskFullPrediction from './DiskFullPrediction';
import ClusterResourceDetail from './ClusterResourceDetail';
import { ServerResource } from '../types/ServerResource';
import moment from 'moment';
import 'moment/locale/zh-cn';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { SelectProps } from 'antd/lib/select';

const { Header, Content } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;

moment.locale('zh-cn');

interface ClusterGroup {
    id: number;
    group_name: string;
    cluster_name: string;
    department_name: string;
}

type RangeValue = [moment.Moment | null, moment.Moment | null] | null;

const DatabaseClusterAnalysis: React.FC = () => {
    const [clusterGroups, setClusterGroups] = useState<ClusterGroup[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [serverResources, setServerResources] = useState<ServerResource[]>([]);
    const [lowThreshold, setLowThreshold] = useState<number>(10);
    const [highThreshold, setHighThreshold] = useState<number>(80);
    const [triggerUpdate, setTriggerUpdate] = useState<number>(0);
    const [emailAddress, setEmailAddress] = useState<string>('');
    const [dateRange, setDateRange] = useState<RangeValue>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        axios.get<ClusterGroup[]>('/api/cmdb/v1/cluster-groups')
            .then(response => {
                setClusterGroups(response.data);
            })
            .catch(error => {
                console.error('Error fetching cluster groups:', error);
            });

        fetchServerResources();
    }, []);

    const fetchServerResources = (startDate?: string, endDate?: string) => {
        const params: any = {};
        if (startDate && endDate) {
            params.startDate = startDate;
            params.endDate = endDate;
        }

        axios.get<ServerResource[]>('/api/cmdb/v1/server-resources', { params })
            .then(response => {
                setServerResources(response.data);
            })
            .catch(error => {
                console.error('Error fetching server resources:', error);
            });
    };

    const handleGroupChange = (value: string[]) => {
        setSelectedGroups(value);
    };

    const handleDepartmentChange = (value: string[]) => {
        setSelectedDepartments(value);
    };

    const handleThresholdChange = useCallback((type: 'low' | 'high', value: number) => {
        if (type === 'low') {
            if (value >= highThreshold) {
                message.error('低阈值不能大于或等于高阈值');
                return;
            }
            setLowThreshold(value);
        } else {
            if (value <= lowThreshold) {
                message.error('高阈值不能小于或等于低阈值');
                return;
            }
            setHighThreshold(value);
        }
        setTriggerUpdate(prev => prev + 1);
    }, [lowThreshold, highThreshold]);

    const handleDateRangeChange = (dates: RangeValue, dateStrings: [string, string]) => {
        setDateRange(dates);
        if (dates) {
            fetchServerResources(dateStrings[0], dateStrings[1]);
        } else {
            fetchServerResources();
        }
    };

    const filteredData = serverResources.filter(resource => {
        const groupMatch = selectedGroups.length === 0 || selectedGroups.includes(resource.group_name);
        const departmentMatch = selectedDepartments.length === 0 || selectedDepartments.includes(resource.department_name);
        return groupMatch && departmentMatch;
    });

    const clusterResourceData = filteredData.reduce((acc, resource) => {
        const existingCluster = acc.find(item => item.clusterName === resource.cluster_name);
        const memoryUsage = (resource.used_memory / resource.total_memory) * 100;
        const diskUsage = (resource.used_disk / resource.total_disk) * 100;
        const cpuUsage = resource.cpu_load;

        if (existingCluster) {
            existingCluster.memory += memoryUsage;
            existingCluster.memoryTotal += resource.total_memory;
            existingCluster.memoryUsed += resource.used_memory;
            existingCluster.disk += diskUsage;
            existingCluster.diskTotal += resource.total_disk;
            existingCluster.diskUsed += resource.used_disk;
            existingCluster.cpu += cpuUsage;
            existingCluster.cpuTotal += 100;
            existingCluster.cpuUsed += resource.cpu_load;
            existingCluster.count += 1;

            existingCluster.maxMemory = Math.max(existingCluster.maxMemory, memoryUsage);
            existingCluster.maxDisk = Math.max(existingCluster.maxDisk, diskUsage);
            existingCluster.maxCPU = Math.max(existingCluster.maxCPU, cpuUsage);
        } else {
            acc.push({
                clusterName: resource.cluster_name,
                groupName: resource.group_name,
                memory: memoryUsage,
                memoryTotal: resource.total_memory,
                memoryUsed: resource.used_memory,
                disk: diskUsage,
                diskTotal: resource.total_disk,
                diskUsed: resource.used_disk,
                cpu: cpuUsage,
                cpuTotal: 100,
                cpuUsed: resource.cpu_load,
                count: 1,
                maxMemory: memoryUsage,
                maxDisk: diskUsage,
                maxCPU: cpuUsage
            });
        }
        return acc;
    }, [] as ClusterResource[]);

    clusterResourceData.forEach(cluster => {
        cluster.memory /= cluster.count;
        cluster.disk /= cluster.count;
        cluster.cpu /= cluster.count;
    });

    const handleSendEmail = async () => {
        if (!emailAddress) {
            message.error('请输入邮件地址');
            return;
        }

        if (contentRef.current) {
            try {
                const canvas = await html2canvas(document.body);
                const imageDataUrl = canvas.toDataURL('image/png');
          
                const emailContent = `
                  <html>
                    <body style="font-family: Arial, sans-serif;">
                      <h1 style="color: #333;">服务器资源使用情况报告</h1>
                      <p>以下是当前服务器资源使用情况的截图：</p>
                      <img src="${imageDataUrl}" alt="Server Resources" style="max-width: 100%;" />
                    </body>
                  </html>
                `;
          
                const response = await (await import('axios')).default.post('/api/cmdb/v1/send-email', {
                  to: emailAddress,
                  subject: '服务器资源使用情况报告',
                  content: emailContent
                });
          
                if (response.data.success) {
                  message.success('邮件发送成功');
                } else {
                  message.error('邮件发送失败');
                }
              } catch (error) {
                console.error('发送邮件时出错：', error);
                message.error('邮件发送失败');
              }
        }
    };

    // const filteredClusterGroups = clusterGroups.filter(group => {
    //     return selectedDepartments.length === 0 || selectedDepartments.includes(group.department_name);
    // });

    const filteredDepartments = clusterGroups.filter(group => {
        return selectedGroups.length === 0 || selectedGroups.includes(group.group_name);
    }).map(group => group.department_name);

    const uniqueClusterGroups = Array.from(new Set(clusterGroups.map(group => group.group_name)));
    const uniqueDepartments = Array.from(new Set(filteredDepartments));

    const groupSelectProps: SelectProps<string[]> = {
        mode: "multiple",
        style: { width: '100%' },
        placeholder: "选择集群组",
        onChange: handleGroupChange,
        value: selectedGroups,
    };

    const departmentSelectProps: SelectProps<string[]> = {
        mode: "multiple",
        style: { width: '100%' },
        placeholder: "选择部门",
        onChange: handleDepartmentChange,
        value: selectedDepartments,
    };

    return (
        <ConfigProvider locale={zhCN}>
            <Layout>
                <Header>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Select {...groupSelectProps}>
                                {uniqueClusterGroups.length > 0 ? (
                                    uniqueClusterGroups.map(groupName => (
                                        <Option key={groupName} value={groupName}>
                                            {groupName}
                                        </Option>
                                    ))
                                ) : (
                                    <Option value="" disabled>暂无数据</Option>
                                )}
                            </Select>
                        </Col>
                        <Col span={8}>
                            <Select {...departmentSelectProps}>
                                {uniqueDepartments.length > 0 ? (
                                    uniqueDepartments.map(departmentName => (
                                        <Option key={departmentName} value={departmentName}>
                                            {departmentName}
                                        </Option>
                                    ))
                                ) : (
                                    <Option value="" disabled>暂无数据</Option>
                                )}
                            </Select>
                        </Col>
                        <Col span={8}>
                            <RangePicker
                                style={{ width: '100%' }}
                                onChange={(dates: any, dateStrings: [string, string]) => handleDateRangeChange(dates, dateStrings)}
                                value={dateRange as any}
                            />
                        </Col>
                    </Row>
                </Header>
                <Content style={{ padding: '20px' }}>
                    <Row gutter={[16, 16]}>
                        <Col span={12} key="email-input">
                            <Input
                                placeholder="输入邮件地址"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                            />
                        </Col>
                        <Col span={12} key="send-email-button">
                            <Button onClick={handleSendEmail}>发送页面截图到邮箱</Button>
                        </Col>
                        <Col span={12} key="low-threshold">
                            低水位阈值
                            <Input
                                type="number"
                                placeholder="低阈值 (%)"
                                value={lowThreshold}
                                onChange={(e) => handleThresholdChange('low', Number(e.target.value))}
                            />
                        </Col>
                        <Col span={12} key="high-threshold">
                            高水位阈值
                            <Input
                                type="number"
                                placeholder="高阈值 (%)"
                                value={highThreshold}
                                onChange={(e) => handleThresholdChange('high', Number(e.target.value))}
                            />
                        </Col>
                    </Row>
                    <div ref={contentRef}>
                        <Row gutter={[16, 16]}>
                            <Col span={24} key="resource-alerts">
                                <Card title="资源警报">
                                    <Alerts 
                                        data={serverResources} 
                                        lowThreshold={lowThreshold} 
                                        highThreshold={highThreshold}
                                        triggerUpdate={triggerUpdate}
                                        selectedGroups={selectedGroups}
                                    />
                                </Card>
                            </Col>
                            <Col span={24} key="resource-alerts-details">
                                <Card title="资源警报详情">
                                    <ResourceAlerts 
                                        data={filteredData} 
                                        lowThreshold={lowThreshold} 
                                        highThreshold={highThreshold}
                                        triggerUpdate={triggerUpdate}
                                        pagination={false}
                                    />
                                </Card>
                            </Col>
                            <Col span={24} key="cluster-resource-usage">
                                <Card title="集群资源使用情况">
                                    <ClusterResourceUsage data={clusterResourceData} />
                                </Card>
                            </Col>
                            <Col span={24} key="disk-full-prediction">
                                <Card title="磁盘空间预测">
                                    <DiskFullPrediction data={filteredData} pagination={false} />
                                </Card>
                            </Col>
                            <Col span={24} key="server-resource-details">
                                <Card title="服务器资源详情">
                                    <ClusterResourceDetail data={filteredData} pagination={false} />
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default DatabaseClusterAnalysis;