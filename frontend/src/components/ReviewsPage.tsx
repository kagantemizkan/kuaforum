import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Text } = Typography;

const ReviewsPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Reviews API Testing</Title>
      <Card title="Coming Soon">
        <Text>Reviews API testing interface will be available soon.</Text>
      </Card>
    </div>
  );
};

export default ReviewsPage;
