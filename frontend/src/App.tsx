import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Layout, Menu, theme, Button, Drawer, Badge } from 'antd';
import {
  ApiOutlined,
  UserOutlined,
  ShopOutlined,
  CalendarOutlined,
  QrcodeOutlined,
  RobotOutlined,
  CreditCardOutlined,
  BarChartOutlined,
  BellOutlined,
  StarOutlined,
  SettingOutlined,
  LoginOutlined,
  LogoutOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import styled from 'styled-components';

// Components
import AuthPage from './components/AuthPage';
import AuthTestingPage from './components/AuthTestingPage';
import UsersPage from './components/UsersPage';
import SalonsPage from './components/SalonsPage';
import BookingsPage from './components/BookingsPage';
import QRPage from './components/QRPage';
import AIPage from './components/AIPage';
import PaymentsPage from './components/PaymentsPage';
import AnalyticsPage from './components/AnalyticsPage';
import NotificationsPage from './components/NotificationsPage';
import ReviewsPage from './components/ReviewsPage';
import AdminPage from './components/AdminPage';
import ApiDocumentation from './components/ApiDocumentation';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ApiProvider } from './contexts/ApiContext';

const { Header, Sider, Content } = Layout;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledHeader = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
  
  .anticon {
    margin-right: 8px;
    font-size: 24px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StyledContent = styled(Content)`
  margin: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const MobileMenuButton = styled(Button)`
  display: none;
  
  @media (max-width: 768px) {
    display: inline-flex;
  }
`;

const menuItems = [
  {
    key: 'auth',
    icon: <LoginOutlined />,
    label: 'Authentication',
    path: '/auth',
  },
  {
    key: 'auth-testing',
    icon: <ApiOutlined />,
    label: 'Auth Testing',
    path: '/auth-testing',
  },
  {
    key: 'users',
    icon: <UserOutlined />,
    label: 'Users',
    path: '/users',
  },
  {
    key: 'salons',
    icon: <ShopOutlined />,
    label: 'Salons',
    path: '/salons',
  },
  {
    key: 'bookings',
    icon: <CalendarOutlined />,
    label: 'Bookings',
    path: '/bookings',
  },
  {
    key: 'qr',
    icon: <QrcodeOutlined />,
    label: 'QR Codes',
    path: '/qr',
  },
  {
    key: 'ai',
    icon: <RobotOutlined />,
    label: 'AI Suggestions',
    path: '/ai',
  },
  {
    key: 'payments',
    icon: <CreditCardOutlined />,
    label: 'Payments',
    path: '/payments',
  },
  {
    key: 'analytics',
    icon: <BarChartOutlined />,
    label: 'Analytics',
    path: '/analytics',
  },
  {
    key: 'notifications',
    icon: <BellOutlined />,
    label: 'Notifications',
    path: '/notifications',
  },
  {
    key: 'reviews',
    icon: <StarOutlined />,
    label: 'Reviews',
    path: '/reviews',
  },
  {
    key: 'admin',
    icon: <SettingOutlined />,
    label: 'Admin',
    path: '/admin',
  },
  {
    key: 'docs',
    icon: <ApiOutlined />,
    label: 'API Docs',
    path: '/docs',
  },
];

const AppContent: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState('auth');
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    const path = window.location.pathname;
    const currentItem = menuItems.find(item => item.path === path);
    if (currentItem) {
      setSelectedKey(currentItem.key);
    }
  }, []);

  const handleMenuClick = (key: string) => {
    const item = menuItems.find(item => item.key === key);
    if (item) {
      setSelectedKey(key);
      window.history.pushState({}, '', item.path);
      setMobileDrawerVisible(false);
    }
  };

  const handleLogout = () => {
    logout();
    setSelectedKey('auth');
    window.history.pushState({}, '', '/auth');
  };

  const siderContent = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      items={menuItems.map(item => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
        onClick: () => handleMenuClick(item.key),
      }))}
    />
  );

  const renderContent = () => {
    switch (selectedKey) {
      case 'auth':
        return <AuthPage />;
      case 'auth-testing':
        return <AuthTestingPage />;
      case 'users':
        return <UsersPage />;
      case 'salons':
        return <SalonsPage />;
      case 'bookings':
        return <BookingsPage />;
      case 'qr':
        return <QRPage />;
      case 'ai':
        return <AIPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'reviews':
        return <ReviewsPage />;
      case 'admin':
        return <AdminPage />;
      case 'docs':
        return <ApiDocumentation />;
      default:
        return <AuthPage />;
    }
  };

  return (
    <StyledLayout>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
        className="desktop-sider"
      >
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Logo>
            <ApiOutlined />
            {!collapsed && 'Hair Salon API'}
          </Logo>
        </div>
        {siderContent}
      </Sider>

      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        bodyStyle={{ padding: 0 }}
        className="mobile-drawer"
      >
        {siderContent}
      </Drawer>

      <Layout style={{ marginLeft: collapsed ? 0 : 200 }}>
        <StyledHeader>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MobileMenuButton
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileDrawerVisible(true)}
            />
            <Button
              type="text"
              icon={collapsed ? <MenuOutlined /> : <MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ marginLeft: 16 }}
              className="desktop-collapse-btn"
            />
            <h2 style={{ margin: 0, marginLeft: 16 }}>
              Hair Salon Ecosystem API Tester
            </h2>
          </div>
          
          <UserInfo>
            {user && (
              <>
                <span>Welcome, {user.firstName} {user.lastName}</span>
                <Badge count={user.role} color="blue" />
                <Button
                  type="primary"
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            )}
          </UserInfo>
        </StyledHeader>

        <StyledContent style={{ background: colorBgContainer }}>
          {renderContent()}
        </StyledContent>
      </Layout>
    </StyledLayout>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ApiProvider>
          <Router>
            <AppContent />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </Router>
        </ApiProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;