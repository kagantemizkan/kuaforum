import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Text } = Typography;

const QRPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>QR Codes API Testing</Title>
      <Card title="Coming Soon">
        <Text>QR Codes API testing interface will be available soon.</Text>
      </Card>
    </div>
  );
};

export default QRPage;
