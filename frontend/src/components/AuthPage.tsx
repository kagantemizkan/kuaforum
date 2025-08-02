import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Select,
  Space,
  Typography,
  Divider,
  Alert,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  LoginOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const StyledCard = styled(Card)`
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const StyledTitle = styled(Title)`
  text-align: center;
  color: #1890ff;
  margin-bottom: 32px;
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 32px;
  }
  
  .ant-tabs-tab {
    font-size: 16px;
    font-weight: 500;
  }
`;

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();

  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = async (values: any) => {
    try {
      setLoginLoading(true);
      setError(null);
      await login(values.email, values.password);
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    try {
      setRegisterLoading(true);
      setError(null);
      await register(values);
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  const loginFormElement = (
    <Form
      form={loginForm}
      name="login"
      onFinish={handleLogin}
      layout="vertical"
      size="large"
    >
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: 'Please enter a valid email!' },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Enter your email"
          autoComplete="email"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loginLoading}
          block
          icon={<LoginOutlined />}
        >
          Sign In
        </Button>
      </Form.Item>
    </Form>
  );

  const registerFormElement = (
    <Form
      form={registerForm}
      name="register"
      onFinish={handleRegister}
      layout="vertical"
      size="large"
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please input your first name!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="First name"
              autoComplete="given-name"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please input your last name!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Last name"
              autoComplete="family-name"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: 'Please enter a valid email!' },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Enter your email"
          autoComplete="email"
        />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Phone Number (Optional)"
      >
        <Input
          prefix={<PhoneOutlined />}
          placeholder="Enter your phone number"
          autoComplete="tel"
        />
      </Form.Item>

      <Form.Item
        name="role"
        label="Role"
        rules={[{ required: true, message: 'Please select your role!' }]}
      >
        <Select placeholder="Select your role">
          <Option value="CUSTOMER">Customer</Option>
          <Option value="SALON_OWNER">Salon Owner</Option>
          <Option value="STAFF">Staff</Option>
          <Option value="ADMIN">Admin</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[
          { required: true, message: 'Please input your password!' },
          { min: 8, message: 'Password must be at least 8 characters!' },
          {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            message: 'Password must contain uppercase, lowercase, number and special character!',
          },
        ]}
        hasFeedback
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Enter your password"
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Confirm Password"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Please confirm your password!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords do not match!'));
            },
          }),
        ]}
        hasFeedback
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Confirm your password"
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={registerLoading}
          block
          icon={<UserAddOutlined />}
        >
          Create Account
        </Button>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    {
      key: 'login',
      label: 'Sign In',
      children: loginFormElement,
    },
    {
      key: 'register',
      label: 'Sign Up',
      children: registerFormElement,
    },
  ];

  return (
    <div style={{ padding: '50px 20px' }}>
      <StyledCard>
        <StyledTitle level={2}>
          Hair Salon Ecosystem
        </StyledTitle>
        
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
          API Testing Interface - Authentication Required
        </Text>

        {error && (
          <Alert
            message="Authentication Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 24 }}
          />
        )}

        <StyledTabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          centered
        />

        <Divider />

        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <strong>Demo Credentials:</strong>
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Admin: admin@hairsalon.com / Admin123!
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Salon Owner: owner@salon.com / Owner123!
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Customer: customer@example.com / Customer123!
          </Text>
        </Space>
      </StyledCard>
    </div>
  );
};

export default AuthPage;