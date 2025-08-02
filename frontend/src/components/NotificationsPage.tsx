import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Text } = Typography;

const NotificationsPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Notifications API Testing</Title>
      <Card title="Coming Soon">
        <Text>Notifications API testing interface will be available soon.</Text>
      </Card>
    </div>
  );
};

export default NotificationsPage;
