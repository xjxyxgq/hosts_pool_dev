import React, { useState, useEffect } from 'react';
import { Layout, Tabs } from 'antd';
import { TabsProps, TabPaneProps } from 'antd/lib/tabs';
import HostList from './components/HostList';
import DatabaseClusterAnalysis from './components/DatabaseClusterAnalysis';
import './App.css';

const { Header, Content } = Layout;
const { TabPane } = Tabs; // Ensure compatibility with antd 3.x
const tabsProps: TabsProps = {
  defaultActiveKey: "1"
};

const tabPane1Props: TabPaneProps = {
  tab: "主机资源池",
  key: "1"
};

const tabPane2Props: TabPaneProps = {
  tab: "主机资源用量分析",
  key: "2"
};
const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/\//g, '-');
  };

  return (
    <Layout className="layout">
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: 'white', margin: 0 }}>数据库主机资源池</h1>
        <span style={{ color: 'white' }}>{formatTime(currentTime)}</span>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <Tabs {...tabsProps}>
            <TabPane {...tabPane1Props}>
              <HostList />
            </TabPane>
            <TabPane {...tabPane2Props}>
              <DatabaseClusterAnalysis />
            </TabPane>
</Tabs>
        </div>
      </Content>
    </Layout>
  );
}

export default App;