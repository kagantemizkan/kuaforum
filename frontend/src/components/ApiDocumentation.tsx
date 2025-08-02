import React from 'react';
import { Typography, Card, Button, Space } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const ApiDocumentation: React.FC = () => {
  const openSwaggerDocs = () => {
    window.open('http://localhost:3000/api-docs', '_blank');
  };

  return (
    <div>
      <Title level={2}>API Documentation</Title>
      <Text type="secondary">
        Complete API documentation and interactive testing interface.
      </Text>
      
      <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 24 }}>
        <Card title="Swagger Documentation" extra={
          <Button type="primary" icon={<LinkOutlined />} onClick={openSwaggerDocs}>
            Open Swagger UI
          </Button>
        }>
          <Paragraph>
            Access the complete interactive API documentation with Swagger UI. 
            Test all endpoints directly from the documentation interface.
          </Paragraph>
          <Text strong>URL: </Text>
          <Text code>http://localhost:3000/api-docs</Text>
        </Card>

        <Card title="API Base URL">
          <Paragraph>
            All API endpoints are available at the following base URL:
          </Paragraph>
          <Text strong>Development: </Text>
          <Text code>http://localhost:3000/v1</Text>
        </Card>

        <Card title="Authentication">
          <Paragraph>
            Most endpoints require JWT authentication. Include the access token in the Authorization header:
          </Paragraph>
          <Text code>Authorization: Bearer YOUR_ACCESS_TOKEN</Text>
        </Card>
      </Space>
    </div>
  );
};

export default ApiDocumentation;
