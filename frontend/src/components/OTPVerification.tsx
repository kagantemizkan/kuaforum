import React, { useState, useEffect } from 'react';
import { Button, Input, Form, Typography, Space, message } from 'antd';
import { PhoneOutlined, SafetyOutlined } from '@ant-design/icons';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { ApiClient } from '../services/apiClient';

const { Title, Text } = Typography;

interface OTPVerificationProps {
  onSuccess: (data: { phone: string; verified: boolean; userId?: string }) => void;
  onError?: (error: string) => void;
  purpose?: 'registration' | 'login' | 'password_reset';
  userId?: string;
  title?: string;
  subtitle?: string;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  onSuccess,
  onError,
  purpose = 'registration',
  userId,
  title = 'Phone Verification',
  subtitle = 'Enter your phone number to receive a verification code'
}) => {
  const [form] = Form.useForm();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [tempUserId, setTempUserId] = useState<string | undefined>(userId);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendOTP = async (phoneNumber: string) => {
    setLoading(true);
    try {
      const response = await ApiClient.auth.sendOTP({
        phone: `+${phoneNumber}`,
        purpose,
        userId: tempUserId,
      });

      if (response.data.success) {
        message.success('Verification code sent successfully!');
        setPhone(`+${phoneNumber}`);
        setStep('otp');
        setCountdown(60); // 60 seconds countdown
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send verification code';
      message.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp: string) => {
    setLoading(true);
    try {
      const response = await ApiClient.auth.verifyOTP({
        phone,
        otp,
        purpose,
        userId: tempUserId,
      });

      if (response.data.success && response.data.verified) {
        message.success('Phone number verified successfully!');
        onSuccess({
          phone,
          verified: true,
          userId: tempUserId,
        });
      } else {
        throw new Error(response.data.message || 'Invalid verification code');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Invalid verification code';
      message.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    try {
      await sendOTP(phone.replace('+', ''));
    } finally {
      setResendLoading(false);
    }
  };

  const onPhoneSubmit = (values: { phone: string }) => {
    sendOTP(values.phone);
  };

  const onOTPSubmit = (values: { otp: string }) => {
    verifyOTP(values.otp);
  };

  const goBack = () => {
    setStep('phone');
    form.resetFields(['otp']);
  };

  if (step === 'phone') {
    return (
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <PhoneOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={3}>{title}</Title>
          <Text type="secondary">{subtitle}</Text>
        </div>

        <Form
          form={form}
          onFinish={onPhoneSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please enter your phone number' },
              { min: 10, message: 'Please enter a valid phone number' },
            ]}
          >
            <PhoneInput
              country={'us'}
              enableSearch
              searchPlaceholder="Search countries"
              inputStyle={{
                width: '100%',
                height: '40px',
                fontSize: '16px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
              }}
              containerStyle={{
                width: '100%',
              }}
              buttonStyle={{
                border: '1px solid #d9d9d9',
                borderRadius: '6px 0 0 6px',
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Send Verification Code
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <SafetyOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
        <Title level={3}>Enter Verification Code</Title>
        <Text type="secondary">
          We've sent a 6-digit code to <strong>{phone}</strong>
        </Text>
      </div>

      <Form
        form={form}
        onFinish={onOTPSubmit}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="otp"
          label="Verification Code"
          rules={[
            { required: true, message: 'Please enter the verification code' },
            { len: 6, message: 'Verification code must be 6 digits' },
            { pattern: /^\d{6}$/, message: 'Please enter a valid 6-digit code' },
          ]}
        >
          <Input
            placeholder="Enter 6-digit code"
            maxLength={6}
            style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }}
            autoComplete="one-time-code"
          />
        </Form.Item>

        <Form.Item>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Verify Code
            </Button>

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">
                Didn't receive the code?{' '}
                <Button
                  type="link"
                  onClick={resendOTP}
                  loading={resendLoading}
                  disabled={countdown > 0}
                  style={{ padding: 0 }}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </Button>
              </Text>
            </div>

            <Button
              type="default"
              onClick={goBack}
              block
              style={{ marginTop: '16px' }}
            >
              Change Phone Number
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default OTPVerification;