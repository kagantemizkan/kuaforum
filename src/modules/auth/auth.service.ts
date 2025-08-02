import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException, 
  BadRequestException,
  ForbiddenException,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { 
  RegisterDto, 
  LoginDto, 
  GoogleOAuthDto, 
  AppleOAuthDto, 
  RefreshTokenDto,
  SendOTPDto,
  VerifyOTPDto,
  PhoneRegistrationDto
} from './dto';
import { 
  AuthResponseDto, 
  RefreshResponseDto, 
  UserResponseDto, 
  TokensDto 
} from './dto/auth-response.dto';
import { SmsOtpService } from './services/sms-otp.service';
import { OAuthService } from './services/oauth.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

interface OAuthUserData {
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  provider: 'google' | 'apple';
  providerId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly smsOtpService: SmsOtpService,
    private readonly oauthService: OAuthService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, phone, role, salonData } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ]
      }
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Validate role-specific registration rules
    await this.validateRegistrationRules(role, salonData);

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    try {
      // Start database transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            id: uuidv4(),
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            role,
            isActive: true,
          },
        });

        // Create customer profile for customers
        if (role === UserRole.CUSTOMER) {
          await tx.customerProfile.create({
            data: {
              id: uuidv4(),
              userId: user.id,
              preferences: {},
              loyaltyTier: 'BRONZE',
            },
          });
        }

        // Create salon and associate with salon owner
        if (role === UserRole.SALON_OWNER && salonData) {
          const salon = await tx.salon.create({
            data: {
              id: uuidv4(),
              name: salonData.salonName,
              description: salonData.salonDescription,
              address: salonData.salonAddress,
              city: salonData.salonCity,
              country: salonData.salonCountry,
              phone: salonData.salonPhone,
              email: salonData.salonEmail,
              website: salonData.salonWebsite,
              subscriptionTier: 'FREE',
              isActive: true,
            },
          });

          // Create salon membership
          await tx.salonMember.create({
            data: {
              id: uuidv4(),
              userId: user.id,
              salonId: salon.id,
              role: 'OWNER',
              isActive: true,
            },
          });

          // Create staff record for salon owner
          await tx.staff.create({
            data: {
              id: uuidv4(),
              salonId: salon.id,
              userId: user.id,
              role: 'OWNER',
              specialties: [],
              isActive: true,
            },
          });
        }

        return user;
      });

      // Generate tokens
      const tokens = await this.generateTokens(result);

      // Save refresh token
      await this.saveRefreshToken(result.id, tokens.refreshToken);

      this.logger.log(`User registered successfully: ${result.email} (${result.role})`);

      return {
        success: true,
        message: 'User registered successfully',
        user: this.mapUserToResponse(result),
        tokens,
      };
    } catch (error) {
      this.logger.error(`Registration failed for ${email}:`, error);
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`User logged in successfully: ${user.email}`);

    return {
      success: true,
      message: 'Login successful',
      user: this.mapUserToResponse(user),
      tokens,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<RefreshResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refresh.secret'),
      }) as JwtPayload;

      // Check if refresh token exists in database
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: payload.sub,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if user is active
      if (!storedToken.user.isActive) {
        throw new ForbiddenException('Account is deactivated');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(storedToken.user);

      // Remove old refresh token and save new one
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      await this.saveRefreshToken(storedToken.user.id, tokens.refreshToken);

      this.logger.log(`Tokens refreshed for user: ${storedToken.user.email}`);

      return {
        success: true,
        message: 'Tokens refreshed successfully',
        tokens,
      };
    } catch (error) {
      this.logger.error('Token refresh failed:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<{ success: boolean; message: string }> {
    try {
      if (refreshToken) {
        // Remove specific refresh token
        await this.prisma.refreshToken.deleteMany({
          where: {
            userId,
            token: refreshToken,
          },
        });
      } else {
        // Remove all refresh tokens for user
        await this.prisma.refreshToken.deleteMany({
          where: { userId },
        });
      }

      this.logger.log(`User logged out: ${userId}`);

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      this.logger.error('Logout failed:', error);
      throw new BadRequestException('Logout failed');
    }
  }

  async googleOAuth(googleOAuthDto: GoogleOAuthDto): Promise<AuthResponseDto> {
    try {
      // Verify Google token and get user data
      const userData = await this.oauthService.verifyGoogleToken(
        googleOAuthDto.accessToken, 
        googleOAuthDto.idToken
      );
      
      // Find or create user
      const user = await this.oauthService.findOrCreateOAuthUser(userData);

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Save refresh token
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      this.logger.log(`Google OAuth login successful: ${user.email}`);

      return {
        success: true,
        message: 'Google authentication successful',
        user: this.mapUserToResponse(user),
        tokens,
      };
    } catch (error) {
      this.logger.error('Google OAuth failed:', error);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  async appleOAuth(appleOAuthDto: AppleOAuthDto): Promise<AuthResponseDto> {
    try {
      // Verify Apple token and get user data
      const userData = await this.oauthService.verifyAppleToken(
        appleOAuthDto.identityToken,
        appleOAuthDto.authorizationCode
      );
      
      // Find or create user
      const user = await this.oauthService.findOrCreateOAuthUser(userData);

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Save refresh token
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      this.logger.log(`Apple OAuth login successful: ${user.email}`);

      return {
        success: true,
        message: 'Apple authentication successful',
        user: this.mapUserToResponse(user),
        tokens,
      };
    } catch (error) {
      this.logger.error('Apple OAuth failed:', error);
      throw new UnauthorizedException('Apple authentication failed');
    }
  }

  /**
   * Send OTP for phone verification
   */
  async sendOTP(sendOtpDto: SendOTPDto): Promise<{ success: boolean; message: string }> {
    const { phone, purpose = 'registration', userId } = sendOtpDto;

    // If no userId provided, create a temporary user ID for the OTP process
    let targetUserId = userId;
    if (!targetUserId) {
      targetUserId = uuidv4();
    }

    await this.smsOtpService.sendOTP(targetUserId, phone, purpose);

    return {
      success: true,
      message: 'Verification code sent successfully',
    };
  }

  /**
   * Verify OTP and complete phone registration
   */
  async verifyOTP(verifyOtpDto: VerifyOTPDto): Promise<{ success: boolean; message: string; verified: boolean }> {
    const { phone, otp, purpose = 'registration', userId } = verifyOtpDto;

    if (!userId) {
      throw new BadRequestException('User ID is required for OTP verification');
    }

    const verified = await this.smsOtpService.verifyOTP(userId, phone, otp, purpose);

    return {
      success: true,
      message: 'Phone number verified successfully',
      verified,
    };
  }

  /**
   * Register user with phone number only (after OTP verification)
   */
  async registerWithPhone(phoneRegistrationDto: PhoneRegistrationDto): Promise<AuthResponseDto> {
    const { phone, firstName, lastName, role = 'CUSTOMER' } = phoneRegistrationDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Create user without password (phone-only registration)
        const user = await tx.user.create({
          data: {
            id: uuidv4(),
            email: `${phone}@phone.local`, // Temporary email
            phone,
            firstName,
            lastName,
            role: role as UserRole,
            isActive: true,
            isPhoneVerified: true,
          },
        });

        // Create customer profile for customers
        if (role === 'CUSTOMER') {
          await tx.customerProfile.create({
            data: {
              id: uuidv4(),
              userId: user.id,
            },
          });
        }

        return user;
      });

      // Generate tokens
      const tokens = await this.generateTokens(result);

      // Save refresh token
      await this.saveRefreshToken(result.id, tokens.refreshToken);

      this.logger.log(`Phone registration successful: ${phone}`);

      return {
        success: true,
        message: 'Registration successful',
        user: this.mapUserToResponse(result),
        tokens,
      };
    } catch (error) {
      this.logger.error('Phone registration failed:', error);
      throw new BadRequestException('Registration failed');
    }
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }

  // Private helper methods
  private async validateRegistrationRules(role: UserRole, salonData?: any): Promise<void> {
    switch (role) {
      case UserRole.CUSTOMER:
        // Customers can register freely
        break;
      
      case UserRole.SALON_OWNER:
        // Salon owners must provide salon data
        if (!salonData) {
          throw new BadRequestException('Salon information is required for salon owner registration');
        }
        break;
      
      case UserRole.STAFF:
        // Staff cannot self-register
        throw new ForbiddenException('Staff accounts must be created by salon owners');
      
      case UserRole.ADMIN:
        // Admins cannot self-register
        throw new ForbiddenException('Admin accounts must be created manually');
      
      default:
        throw new BadRequestException('Invalid user role');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>('app.bcryptRounds') || 12;
    return bcrypt.hash(password, saltRounds);
  }

  private async generateTokens(user: any): Promise<TokensDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessTokenExpiresIn = this.configService.get<string>('jwt.expiresIn') || '15m';
    const refreshTokenExpiresIn = this.configService.get<string>('jwt.refresh.expiresIn') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refresh.secret'),
        expiresIn: refreshTokenExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpirationTime(accessTokenExpiresIn),
      tokenType: 'Bearer',
    };
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresIn = this.configService.get<string>('jwt.refresh.expiresIn') || '7d';
    const expiresAt = new Date(Date.now() + this.parseExpirationTime(expiresIn) * 1000);

    await this.prisma.refreshToken.create({
      data: {
        id: uuidv4(),
        userId,
        token,
        expiresAt,
      },
    });
  }

  private parseExpirationTime(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 900;
    }
  }

  private mapUserToResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async verifyGoogleToken(accessToken: string): Promise<OAuthUserData> {
    // TODO: Implement Google token verification
    // This would typically involve calling Google's tokeninfo endpoint
    // For now, returning mock data - implement actual verification
    throw new Error('Google OAuth verification not implemented yet');
  }

  private async verifyAppleToken(appleOAuthDto: AppleOAuthDto): Promise<OAuthUserData> {
    // TODO: Implement Apple token verification
    // This would typically involve verifying the JWT signature with Apple's public keys
    // For now, returning mock data - implement actual verification
    throw new Error('Apple OAuth verification not implemented yet');
  }

  private async findOrCreateOAuthUser(userData: OAuthUserData) {
    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!user) {
      // Create new user for OAuth
      user = await this.prisma.user.create({
        data: {
          id: uuidv4(),
          email: userData.email,
          password: '', // OAuth users don't have passwords
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: userData.avatar,
          role: UserRole.CUSTOMER, // OAuth users are customers by default
          isActive: true,
        },
      });

      // Create customer profile
      await this.prisma.customerProfile.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          preferences: {},
          loyaltyTier: 'BRONZE',
        },
      });
    }

    return user;
  }
}