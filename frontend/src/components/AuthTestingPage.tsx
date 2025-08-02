import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Input,
  Form,
  Alert,
  Descriptions,
  Divider,
  Row,
  Col,
  Tag,
  message,
  Collapse,
  Switch,
} from 'antd';
import {
  GoogleOutlined,
  AppleOutlined,
  ProfileOutlined,
  CheckCircleOutlined,
  LogoutOutlined,
  RestOutlined,
  UserOutlined,
  LoginOutlined,
  UserAddOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/apiClient';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
  .ant-card-head {
    background: #f5f5f5;
  }
`;

const ResponseDisplay = styled.div`
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 12px;
  margin-top: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
`;

const AuthTestingPage: React.FC = () => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [showRawResponses, setShowRawResponses] = useState(false);
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
  const [oauthForm] = Form.useForm();

  const setLoadingState = (key: string, value: boolean) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  };

  const setResponse = (key: string, response: any) => {
    setResponses((prev) => ({ ...prev, [key]: response }));
  };

  const handleLogin = async (values: any) => {
    try {
      setLoadingState('login', true);
      const response = await ApiService.auth.login(values);
      setResponse('login', response.data);
      message.success('Login successful');
    } catch (error: any) {
      setResponse('login', { error: error.response?.data || error.message });
      message.error('Login failed');
    } finally {
      setLoadingState('login', false);
    }
  };

  const handleRegister = async (values: any) => {
    try {
      setLoadingState('register', true);
      const response = await ApiService.auth.register(values);
      setResponse('register', response.data);
      message.success('Registration successful');
    } catch (error: any) {
      setResponse('register', { error: error.response?.data || error.message });
      message.error('Registration failed');
    } finally {
      setLoadingState('register', false);
    }
  };

  const handleRefreshToken = async () => {
    try {
      setLoadingState('refresh', true);
      const refreshToken =
        localStorage.getItem('refreshToken') || 'dummy_refresh_token';
      const response = await ApiService.auth.refresh(refreshToken);
      setResponse('refresh', response.data);
      message.success('Token refresh successful');
    } catch (error: any) {
      setResponse('refresh', { error: error.response?.data || error.message });
      message.error('Token refresh failed');
    } finally {
      setLoadingState('refresh', false);
    }
  };

  const handleGoogleOAuth = async (values: any) => {
    try {
      setLoadingState('google', true);
      const response = await ApiService.auth.googleOAuth(values);
      setResponse('google', response.data);
      message.success('Google OAuth test successful');
    } catch (error: any) {
      setResponse('google', { error: error.response?.data || error.message });
      message.error('Google OAuth failed');
    } finally {
      setLoadingState('google', false);
    }
  };

  const handleAppleOAuth = async (values: any) => {
    try {
      setLoadingState('apple', true);
      const response = await ApiService.auth.appleOAuth(values);
      setResponse('apple', response.data);
      message.success('Apple OAuth test successful');
    } catch (error: any) {
      setResponse('apple', { error: error.response?.data || error.message });
      message.error('Apple OAuth failed');
    } finally {
      setLoadingState('apple', false);
    }
  };

  const handleGetProfile = async () => {
    try {
      setLoadingState('profile', true);
      const response = await ApiService.auth.getProfile();
      setResponse('profile', response.data);
      message.success('Profile fetched successfully');
    } catch (error: any) {
      setResponse('profile', { error: error.response?.data || error.message });
      message.error('Failed to fetch profile');
    } finally {
      setLoadingState('profile', false);
    }
  };

  const handleCheckStatus = async () => {
    try {
      setLoadingState('status', true);
      const response = await ApiService.auth.checkStatus();
      setResponse('status', response.data);
      message.success('Status check successful');
    } catch (error: any) {
      setResponse('status', { error: error.response?.data || error.message });
      message.error('Status check failed');
    } finally {
      setLoadingState('status', false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoadingState('logout', true);
      const response = await ApiService.auth.logout();
      setResponse('logout', response.data);
      message.success('Logout successful');
    } catch (error: any) {
      setResponse('logout', { error: error.response?.data || error.message });
      message.error('Logout failed');
    } finally {
      setLoadingState('logout', false);
    }
  };

  const renderResponse = (key: string) => {
    const response = responses[key];
    if (!response) return null;

    return (
      <ResponseDisplay>{JSON.stringify(response, null, 2)}</ResponseDisplay>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <ApiOutlined /> Auth Endpoints Testing Interface
      </Title>

      <Row style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Text>Show Raw Responses:</Text>
            <Switch checked={showRawResponses} onChange={setShowRawResponses} />
          </Space>
        </Col>
      </Row>

      {user && (
        <Alert
          message={`Authenticated as: ${user.firstName} ${user.lastName} (${user.role})`}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Collapse defaultActiveKey={user ? ['profile'] : ['login']}>
        <Panel header="Login" key="login">
          <StyledCard
            title="POST /auth/login"
            extra={<Tag color="blue">Public</Tag>}
          >
            <Form form={loginForm} onFinish={handleLogin} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true, type: 'email' }]}
                  >
                    <Input placeholder="admin@hairsalon.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true }]}
                  >
                    <Input.Password placeholder="Admin123!" />
                  </Form.Item>
                </Col>
              </Row>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading.login}
                icon={<LoginOutlined />}
              >
                Test Login
              </Button>
            </Form>
            {showRawResponses && renderResponse('login')}
          </StyledCard>
        </Panel>

        <Panel header="Register" key="register">
          <StyledCard
            title="POST /auth/register"
            extra={<Tag color="blue">Public</Tag>}
          >
            <Form
              form={registerForm}
              onFinish={handleRegister}
              layout="vertical"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="John" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Doe" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true, type: 'email' }]}
                  >
                    <Input placeholder="john.doe@example.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="phone" label="Phone (Optional)">
                    <Input placeholder="+1234567890" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="role"
                    label="Role"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="CUSTOMER" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true }]}
                  >
                    <Input.Password placeholder="Password123!" />
                  </Form.Item>
                </Col>
              </Row>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading.register}
                icon={<UserAddOutlined />}
              >
                Test Register
              </Button>
            </Form>
            {showRawResponses && renderResponse('register')}
          </StyledCard>
        </Panel>

        <Panel header="Google OAuth" key="google">
          <StyledCard
            title="POST /auth/oauth/google"
            extra={<Tag color="blue">Public</Tag>}
          >
            <Form
              form={oauthForm}
              onFinish={handleGoogleOAuth}
              layout="vertical"
            >
              <Form.Item
                name="accessToken"
                label="Access Token"
                rules={[{ required: true }]}
              >
                <TextArea placeholder="ya29.a0ARrdaM9..." rows={3} />
              </Form.Item>
              <Form.Item name="idToken" label="ID Token (Optional)">
                <TextArea placeholder="eyJhbGciOiJSUzI1NiIs..." rows={3} />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading.google}
                icon={<GoogleOutlined />}
              >
                Test Google OAuth
              </Button>
            </Form>
            {showRawResponses && renderResponse('google')}
          </StyledCard>
        </Panel>

        <Panel header="Apple OAuth" key="apple">
          <StyledCard
            title="POST /auth/oauth/apple"
            extra={<Tag color="blue">Public</Tag>}
          >
            <Form onFinish={handleAppleOAuth} layout="vertical">
              <Form.Item
                name="identityToken"
                label="Identity Token"
                rules={[{ required: true }]}
              >
                <TextArea
                  placeholder="eyJraWQiOiJlWGF1bm1MIiwiYWxnIjoiUlMyNTYifQ..."
                  rows={3}
                />
              </Form.Item>
              <Form.Item
                name="authorizationCode"
                label="Authorization Code (Optional)"
              >
                <TextArea
                  placeholder="c6a9d4c8e7f4b2d3a1e5f8c9b2d4e7f1a3c5e8f9..."
                  rows={2}
                />
              </Form.Item>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="email" label="Email (Optional)">
                    <Input placeholder="user@privaterelay.appleid.com" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="firstName" label="First Name (Optional)">
                    <Input placeholder="John" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="lastName" label="Last Name (Optional)">
                    <Input placeholder="Doe" />
                  </Form.Item>
                </Col>
              </Row>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading.apple}
                icon={<AppleOutlined />}
              >
                Test Apple OAuth
              </Button>
            </Form>
            {showRawResponses && renderResponse('apple')}
          </StyledCard>
        </Panel>

        <Panel header="Refresh Token" key="refresh">
          <StyledCard
            title="POST /auth/refresh"
            extra={<Tag color="blue">Public</Tag>}
          >
            <Paragraph>
              Tests the token refresh endpoint. Uses stored refresh token or
              dummy token for testing.
            </Paragraph>
            <Button
              type="primary"
              onClick={handleRefreshToken}
              loading={loading.refresh}
              icon={<RestOutlined />}
            >
              Test Refresh Token
            </Button>
            {showRawResponses && renderResponse('refresh')}
          </StyledCard>
        </Panel>

        <Panel header="Get Profile" key="profile">
          <StyledCard
            title="GET /auth/me"
            extra={<Tag color="orange">Protected</Tag>}
          >
            <Paragraph>
              Fetches the current user's profile. Requires valid authentication
              token.
            </Paragraph>
            <Button
              type="primary"
              onClick={handleGetProfile}
              loading={loading.profile}
              icon={<ProfileOutlined />}
            >
              Get Profile
            </Button>
            {showRawResponses && renderResponse('profile')}
          </StyledCard>
        </Panel>

        <Panel header="Check Status" key="status">
          <StyledCard
            title="GET /auth/status"
            extra={<Tag color="orange">Protected</Tag>}
          >
            <Paragraph>
              Checks the authentication status and validates the current token.
            </Paragraph>
            <Button
              type="primary"
              onClick={handleCheckStatus}
              loading={loading.status}
              icon={<CheckCircleOutlined />}
            >
              Check Auth Status
            </Button>
            {showRawResponses && renderResponse('status')}
          </StyledCard>
        </Panel>

        <Panel header="Logout" key="logout">
          <StyledCard
            title="POST /auth/logout"
            extra={<Tag color="orange">Protected</Tag>}
          >
            <Paragraph>
              Logs out the user and invalidates the refresh token.
            </Paragraph>
            <Button
              type="primary"
              danger
              onClick={handleLogout}
              loading={loading.logout}
              icon={<LogoutOutlined />}
            >
              Test Logout
            </Button>
            {showRawResponses && renderResponse('logout')}
          </StyledCard>
        </Panel>
      </Collapse>

      <Divider />

      <Title level={4}>Quick Test Credentials</Title>
      <Descriptions bordered size="small">
        <Descriptions.Item label="Admin" span={3}>
          admin@hairsalon.com / Admin123!
        </Descriptions.Item>
        <Descriptions.Item label="Salon Owner" span={3}>
          owner@salon.com / Owner123!
        </Descriptions.Item>
        <Descriptions.Item label="Customer" span={3}>
          customer@example.com / Customer123!
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default AuthTestingPage;
