import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Text } = Typography;

const SalonsPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Salons API Testing</Title>
      <Card title="Coming Soon">
        <Text>Salon management API testing interface will be available soon.</Text>
      </Card>
    </div>
  );
};

export default SalonsPage;