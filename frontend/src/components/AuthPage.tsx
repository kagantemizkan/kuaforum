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
  message,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  LoginOutlined,
  UserAddOutlined,
  GoogleOutlined,
  AppleOutlined,
  ProfileOutlined,
  CheckCircleOutlined,
  LogoutOutlined,
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

const OAuthSection = styled.div`
  margin: 24px 0;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
`;

const TestingSection = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
`;

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [testingLoading, setTestingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    user,
    login,
    register,
    logout,
    googleOAuth,
    appleOAuth,
    getProfile,
    checkStatus,
  } = useAuth();

  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = async (values: any) => {
    try {
      setLoginLoading(true);
      setError(null);
      await login(values.email, values.password);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
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
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    try {
      setOauthLoading(true);
      setError(null);
      // For testing purposes, using a dummy token
      // In real implementation, you'd get this from Google OAuth flow
      const dummyToken = 'dummy_google_access_token_for_testing';
      await googleOAuth(dummyToken);
      message.success('Google OAuth test initiated (dummy token used)');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Google OAuth failed');
    } finally {
      setOauthLoading(false);
    }
  };

  const handleAppleOAuth = async () => {
    try {
      setOauthLoading(true);
      setError(null);
      // For testing purposes, using dummy data
      // In real implementation, you'd get this from Apple OAuth flow
      const dummyData = {
        identityToken: 'dummy_apple_identity_token_for_testing',
        email: 'test@privaterelay.appleid.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      await appleOAuth(dummyData);
      message.success('Apple OAuth test initiated (dummy token used)');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Apple OAuth failed');
    } finally {
      setOauthLoading(false);
    }
  };

  const handleGetProfile = async () => {
    try {
      setTestingLoading(true);
      const profile = await getProfile();
      message.success(
        `Profile fetched: ${profile.firstName} ${profile.lastName}`,
      );
      console.log('Profile data:', profile);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setTestingLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    try {
      setTestingLoading(true);
      const status = await checkStatus();
      message.success(
        `Auth status: ${status.authenticated ? 'Authenticated' : 'Not authenticated'}`,
      );
      console.log('Status data:', status);
    } catch (error: any) {
      message.error('Failed to check status');
    } finally {
      setTestingLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setTestingLoading(true);
      await logout();
    } catch (error: any) {
      message.error('Logout failed');
    } finally {
      setTestingLoading(false);
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
            rules={[
              { required: true, message: 'Please input your first name!' },
            ]}
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
            rules={[
              { required: true, message: 'Please input your last name!' },
            ]}
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

      <Form.Item name="phone" label="Phone Number (Optional)">
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
            pattern:
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            message:
              'Password must contain uppercase, lowercase, number and special character!',
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
      {/* 
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
      </Form.Item> */}

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
        <StyledTitle level={2}>Hair Salon Ecosystem</StyledTitle>

        <Text
          type="secondary"
          style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}
        >
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

        {!user && (
          <OAuthSection>
            <Title level={4} style={{ marginBottom: 16, textAlign: 'center' }}>
              OAuth Testing
            </Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="default"
                icon={<GoogleOutlined />}
                loading={oauthLoading}
                onClick={handleGoogleOAuth}
                block
                size="large"
              >
                Test Google OAuth
              </Button>
              <Button
                type="default"
                icon={<AppleOutlined />}
                loading={oauthLoading}
                onClick={handleAppleOAuth}
                block
                size="large"
              >
                Test Apple OAuth
              </Button>
            </Space>
          </OAuthSection>
        )}

        {user && (
          <TestingSection>
            <Title level={4} style={{ marginBottom: 16, textAlign: 'center' }}>
              Auth Endpoint Testing
            </Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text
                style={{
                  textAlign: 'center',
                  display: 'block',
                  marginBottom: 16,
                }}
              >
                Welcome, {user.firstName} {user.lastName}! ({user.role})
              </Text>
              <Button
                type="primary"
                icon={<ProfileOutlined />}
                loading={testingLoading}
                onClick={handleGetProfile}
                block
              >
                Get Profile
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={testingLoading}
                onClick={handleCheckStatus}
                block
              >
                Check Auth Status
              </Button>
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                loading={testingLoading}
                onClick={handleLogout}
                block
              >
                Log Out
              </Button>
            </Space>
          </TestingSection>
        )}

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
          <Text type="secondary" style={{ fontSize: '12px', marginTop: 8 }}>
            <strong>Note:</strong> OAuth buttons use dummy tokens for testing
            backend endpoints.
          </Text>
        </Space>
      </StyledCard>
    </div>
  );
};

export default AuthPage;
