import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Text } = Typography;

const PaymentsPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Payments API Testing</Title>
      <Card title="Coming Soon">
        <Text>Payments API testing interface will be available soon.</Text>
      </Card>
    </div>
  );
};

export default PaymentsPage;
