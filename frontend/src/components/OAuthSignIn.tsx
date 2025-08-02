import React from 'react';
import { Button, Space, Divider, Typography, message } from 'antd';
import { GoogleOutlined, AppleOutlined } from '@ant-design/icons';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { ApiClient } from '../services/apiClient';

const { Text } = Typography;

interface OAuthSignInProps {
  onSuccess: (data: any) => void;
  onError?: (error: string) => void;
  mode?: 'login' | 'register';
  googleClientId?: string;
}

const GoogleSignInButton: React.FC<{
  onSuccess: (data: any) => void;
  onError?: (error: string) => void;
  mode: 'login' | 'register';
}> = ({ onSuccess, onError, mode }) => {
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await ApiClient.auth.googleOAuth({
          accessToken: tokenResponse.access_token,
          idToken: (tokenResponse as any).id_token,
        });

        if (response.data.success) {
          message.success(`Google ${mode} successful!`);
          onSuccess(response.data);
        } else {
          throw new Error(response.data.message || `Google ${mode} failed`);
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || `Google ${mode} failed`;
        message.error(errorMessage);
        onError?.(errorMessage);
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      const errorMessage = `Google ${mode} failed`;
      message.error(errorMessage);
      onError?.(errorMessage);
    },
    flow: 'auth-code',
  });

  return (
    <Button
      icon={<GoogleOutlined />}
      onClick={() => googleLogin()}
      block
      size="large"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '48px',
        borderColor: '#db4437',
        color: '#db4437',
      }}
    >
      Continue with Google
    </Button>
  );
};

const AppleSignInButton: React.FC<{
  onSuccess: (data: any) => void;
  onError?: (error: string) => void;
  mode: 'login' | 'register';
}> = ({ onSuccess, onError, mode }) => {
  const handleAppleSignIn = async () => {
    try {
      // For web, Apple Sign In requires more complex setup
      // This is a placeholder for the actual Apple Sign In implementation
      message.info('Apple Sign In is not yet implemented for web. Please use mobile app.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || `Apple ${mode} failed`;
      message.error(errorMessage);
      onError?.(errorMessage);
    }
  };

  return (
    <Button
      icon={<AppleOutlined />}
      onClick={handleAppleSignIn}
      block
      size="large"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '48px',
        backgroundColor: '#000',
        borderColor: '#000',
        color: '#fff',
      }}
    >
      Continue with Apple
    </Button>
  );
};

export const OAuthSignIn: React.FC<OAuthSignInProps> = ({ 
  onSuccess, 
  onError, 
  mode = 'login',
  googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || ''
}) => {
  if (!googleClientId) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Text type="secondary">OAuth configuration not found</Text>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <Divider>
        <Text type="secondary">Or continue with</Text>
      </Divider>
      
      <GoogleOAuthProvider clientId={googleClientId}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <GoogleSignInButton 
            onSuccess={onSuccess}
            onError={onError}
            mode={mode}
          />
          
          <AppleSignInButton 
            onSuccess={onSuccess}
            onError={onError}
            mode={mode}
          />
        </Space>
      </GoogleOAuthProvider>
    </div>
  );
};

export default OAuthSignIn;