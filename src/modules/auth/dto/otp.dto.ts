import { 
  IsString, 
  IsPhoneNumber, 
  IsNotEmpty, 
  Length,
  IsOptional,
  IsEnum
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OTPPurpose {
  REGISTRATION = 'registration',
  LOGIN = 'login',
  PASSWORD_RESET = 'password_reset',
}

export class SendOTPDto {
  @ApiProperty({ 
    description: 'Phone number to send OTP to',
    example: '+1234567890'
  })
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone: string;

  @ApiPropertyOptional({ 
    description: 'Purpose of OTP verification',
    enum: OTPPurpose,
    default: OTPPurpose.REGISTRATION
  })
  @IsOptional()
  @IsEnum(OTPPurpose, { message: 'Invalid OTP purpose' })
  purpose?: OTPPurpose = OTPPurpose.REGISTRATION;

  @ApiPropertyOptional({ 
    description: 'User ID (for existing users)',
    example: 'uuid-string'
  })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class VerifyOTPDto {
  @ApiProperty({ 
    description: 'Phone number that received the OTP',
    example: '+1234567890'
  })
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone: string;

  @ApiProperty({ 
    description: '6-digit OTP code',
    example: '123456'
  })
  @IsString()
  @IsNotEmpty({ message: 'OTP code is required' })
  @Length(6, 6, { message: 'OTP code must be exactly 6 digits' })
  otp: string;

  @ApiPropertyOptional({ 
    description: 'Purpose of OTP verification',
    enum: OTPPurpose,
    default: OTPPurpose.REGISTRATION
  })
  @IsOptional()
  @IsEnum(OTPPurpose, { message: 'Invalid OTP purpose' })
  purpose?: OTPPurpose = OTPPurpose.REGISTRATION;

  @ApiPropertyOptional({ 
    description: 'User ID (for existing users)',
    example: 'uuid-string'
  })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class PhoneRegistrationDto {
  @ApiProperty({ 
    description: 'Phone number for registration',
    example: '+1234567890'
  })
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone: string;

  @ApiProperty({ 
    description: 'User first name',
    example: 'John'
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiProperty({ 
    description: 'User last name',
    example: 'Doe'
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @ApiPropertyOptional({ 
    description: 'User role',
    enum: ['CUSTOMER', 'SALON_OWNER'],
    default: 'CUSTOMER'
  })
  @IsOptional()
  @IsString()
  role?: string = 'CUSTOMER';
}