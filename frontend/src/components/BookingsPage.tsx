import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Text } = Typography;

const BookingsPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Bookings API Testing</Title>
      <Card title="Coming Soon">
        <Text>Bookings API testing interface will be available soon.</Text>
      </Card>
    </div>
  );
};

export default BookingsPage;
