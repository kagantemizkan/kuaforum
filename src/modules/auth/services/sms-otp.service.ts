import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import * as twilio from 'twilio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SmsOtpService {
  private readonly logger = new Logger(SmsOtpService.name);
  private twilioClient: twilio.Twilio;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    
    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    } else {
      this.logger.warn('Twilio credentials not configured. SMS OTP will not work.');
    }
  }

  /**
   * Generate a 6-digit OTP code
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(userId: string, phone: string, purpose: string = 'registration'): Promise<void> {
    if (!this.twilioClient) {
      throw new BadRequestException('SMS service not configured');
    }

    // Clean up expired OTPs
    await this.cleanupExpiredOTPs(userId, phone);

    // Check if there's a recent OTP request (rate limiting)
    const recentOTP = await this.prisma.oTPVerification.findFirst({
      where: {
        userId,
        phone,
        purpose,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000), // 1 minute ago
        },
      },
    });

    if (recentOTP) {
      throw new BadRequestException('Please wait before requesting another OTP');
    }

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    try {
      // Send SMS via Twilio
      const twilioPhoneNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');
      await this.twilioClient.messages.create({
        body: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
        from: twilioPhoneNumber,
        to: phone,
      });

      // Store OTP in database
      await this.prisma.oTPVerification.create({
        data: {
          id: uuidv4(),
          userId,
          phone,
          otp,
          purpose,
          expiresAt,
        },
      });

      this.logger.log(`OTP sent to ${phone} for user ${userId}`);
    } catch (error) {
      this.logger.error('Failed to send OTP:', error);
      throw new BadRequestException('Failed to send verification code');
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(userId: string, phone: string, otp: string, purpose: string = 'registration'): Promise<boolean> {
    const otpRecord = await this.prisma.oTPVerification.findFirst({
      where: {
        userId,
        phone,
        purpose,
        verified: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    // Increment attempts
    await this.prisma.oTPVerification.update({
      where: { id: otpRecord.id },
      data: { attempts: otpRecord.attempts + 1 },
    });

    // Check max attempts (5 attempts allowed)
    if (otpRecord.attempts >= 4) {
      await this.prisma.oTPVerification.update({
        where: { id: otpRecord.id },
        data: { verified: false },
      });
      throw new UnauthorizedException('Too many verification attempts. Please request a new code.');
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Mark as verified
    await this.prisma.oTPVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // Update user's phone verification status
    await this.prisma.user.update({
      where: { id: userId },
      data: { isPhoneVerified: true },
    });

    this.logger.log(`OTP verified successfully for user ${userId}`);
    return true;
  }

  /**
   * Clean up expired OTP records
   */
  private async cleanupExpiredOTPs(userId: string, phone: string): Promise<void> {
    await this.prisma.oTPVerification.deleteMany({
      where: {
        userId,
        phone,
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Check if phone number is verified for user
   */
  async isPhoneVerified(userId: string, phone: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return user?.phone === phone && user?.isPhoneVerified === true;
  }
}