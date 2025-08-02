import React, { useState } from 'react';
import { Form, Input, Button, Select, Typography, Space, message, Card } from 'antd';
import { UserOutlined, PhoneOutlined } from '@ant-design/icons';
import OTPVerification from './OTPVerification';
import { ApiClient } from '../services/apiClient';

const { Title, Text } = Typography;
const { Option } = Select;

interface PhoneRegistrationProps {
  onSuccess: (data: any) => void;
  onError?: (error: string) => void;
  allowedRoles?: string[];
}

interface UserData {
  firstName: string;
  lastName: string;
  role: string;
}

export const PhoneRegistration: React.FC<PhoneRegistrationProps> = ({
  onSuccess,
  onError,
  allowedRoles = ['CUSTOMER', 'SALON_OWNER']
}) => {
  const [form] = Form.useForm();
  const [step, setStep] = useState<'user-info' | 'otp' | 'complete'>('user-info');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [verifiedPhone, setVerifiedPhone] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const onUserInfoSubmit = (values: UserData) => {
    setUserData(values);
    setStep('otp');
  };

  const onOTPSuccess = (data: { phone: string; verified: boolean }) => {
    if (data.verified) {
      setVerifiedPhone(data.phone);
      completeRegistration(data.phone);
    }
  };

  const completeRegistration = async (phone: string) => {
    if (!userData) return;

    setLoading(true);
    try {
      const response = await ApiClient.auth.registerWithPhone({
        phone,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      });

      if (response.data.success) {
        message.success('Registration completed successfully!');
        setStep('complete');
        onSuccess(response.data);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      message.error(errorMessage);
      onError?.(errorMessage);
      // Go back to OTP step to try again
      setStep('otp');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'otp') {
      setStep('user-info');
    }
  };

  if (step === 'user-info') {
    return (
      <Card style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <UserOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={3}>Create Your Account</Title>
          <Text type="secondary">Enter your details to get started</Text>
        </div>

        <Form
          form={form}
          onFinish={onUserInfoSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[
              { required: true, message: 'Please enter your first name' },
              { min: 2, message: 'First name must be at least 2 characters' },
              { max: 50, message: 'First name cannot exceed 50 characters' },
            ]}
          >
            <Input placeholder="Enter your first name" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[
              { required: true, message: 'Please enter your last name' },
              { min: 2, message: 'Last name must be at least 2 characters' },
              { max: 50, message: 'Last name cannot exceed 50 characters' },
            ]}
          >
            <Input placeholder="Enter your last name" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Account Type"
            rules={[{ required: true, message: 'Please select your account type' }]}
            initialValue="CUSTOMER"
          >
            <Select placeholder="Select account type">
              {allowedRoles.includes('CUSTOMER') && (
                <Option value="CUSTOMER">Customer</Option>
              )}
              {allowedRoles.includes('SALON_OWNER') && (
                <Option value="SALON_OWNER">Salon Owner</Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
            >
              Continue
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  }

  if (step === 'otp') {
    return (
      <Card style={{ maxWidth: 500, margin: '0 auto' }}>
        <OTPVerification
          onSuccess={onOTPSuccess}
          onError={onError}
          purpose="registration"
          title="Verify Your Phone"
          subtitle="We need to verify your phone number to complete registration"
        />
        
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Button type="link" onClick={goBack}>
            ← Back to Account Details
          </Button>
        </div>
      </Card>
    );
  }

  if (step === 'complete') {
    return (
      <Card style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ padding: '40px 20px' }}>
          <div style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }}>
            ✓
          </div>
          <Title level={2} style={{ color: '#52c41a', marginBottom: '16px' }}>
            Welcome!
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Your account has been created successfully. You can now start using our services.
          </Text>
        </div>
      </Card>
    );
  }

  return null;
};

export default PhoneRegistration;