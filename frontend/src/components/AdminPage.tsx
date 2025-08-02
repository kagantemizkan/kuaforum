import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Text } = Typography;

const AdminPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Admin API Testing</Title>
      <Card title="Coming Soon">
        <Text>Admin API testing interface will be available soon.</Text>
      </Card>
    </div>
  );
};

export default AdminPage;
