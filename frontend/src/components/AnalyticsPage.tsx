import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Text } = Typography;

const AnalyticsPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Analytics API Testing</Title>
      <Card title="Coming Soon">
        <Text>Analytics API testing interface will be available soon.</Text>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
