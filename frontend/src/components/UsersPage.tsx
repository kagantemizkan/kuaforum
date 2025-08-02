import React from 'react';
import { Typography, Card, Space } from 'antd';

const { Title, Text } = Typography;

const UsersPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Users API Testing</Title>
      <Text type="secondary">
        Test user management endpoints including profiles, authentication, and user data.
      </Text>
      
      <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 24 }}>
        <Card title="Coming Soon" style={{ textAlign: 'center' }}>
          <Text>User management API testing interface will be available soon.</Text>
        </Card>
      </Space>
    </div>
  );
};

export default UsersPage;