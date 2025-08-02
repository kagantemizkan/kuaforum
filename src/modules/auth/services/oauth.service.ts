import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import { GoogleAuth } from 'google-auth-library';
import { verifyIdToken } from 'apple-signin-auth';
import { UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export interface OAuthUserData {
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  provider: 'google' | 'apple';
  providerId: string;
}

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);
  private googleAuth: GoogleAuth;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // Initialize Google Auth
    this.googleAuth = new GoogleAuth({
      credentials: {
        client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
        client_secret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      },
    });
  }

  /**
   * Verify Google OAuth token and extract user data
   */
  async verifyGoogleToken(accessToken: string, idToken?: string): Promise<OAuthUserData> {
    try {
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      
      if (!clientId) {
        throw new BadRequestException('Google OAuth not configured');
      }

      // Use ID token if provided, otherwise use access token
      const tokenToVerify = idToken || accessToken;
      
      const client = await this.googleAuth.getClient();
      const ticket = await client.verifyIdToken({
        idToken: tokenToVerify,
        audience: clientId,
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      return {
        email: payload.email!,
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        avatar: payload.picture,
        provider: 'google',
        providerId: payload.sub,
      };
    } catch (error) {
      this.logger.error('Google token verification failed:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  /**
   * Verify Apple OAuth token and extract user data
   */
  async verifyAppleToken(identityToken: string, authorizationCode?: string): Promise<OAuthUserData> {
    try {
      const clientId = this.configService.get<string>('APPLE_CLIENT_ID');
      
      if (!clientId) {
        throw new BadRequestException('Apple OAuth not configured');
      }

      const decodedToken = await verifyIdToken(identityToken, {
        audience: clientId,
        ignoreExpiration: false,
      });

      if (!decodedToken) {
        throw new UnauthorizedException('Invalid Apple token');
      }

      // Apple doesn't always provide name information in subsequent logins
      // The name is usually only provided during the first authorization
      const email = decodedToken.email as string;
      const nameParts = email.split('@')[0].split('.');
      
      return {
        email,
        firstName: nameParts[0] || 'User',
        lastName: nameParts[1] || '',
        provider: 'apple',
        providerId: decodedToken.sub as string,
      };
    } catch (error) {
      this.logger.error('Apple token verification failed:', error);
      throw new UnauthorizedException('Invalid Apple token');
    }
  }

  /**
   * Find or create OAuth user
   */
  async findOrCreateOAuthUser(userData: OAuthUserData): Promise<any> {
    const { email, firstName, lastName, avatar, provider, providerId } = userData;

    // Check if user exists by email
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Update OAuth provider info if not set
      const updateData: any = {};
      
      if (provider === 'google' && !user.googleId) {
        updateData.googleId = providerId;
      } else if (provider === 'apple' && !user.appleId) {
        updateData.appleId = providerId;
      }

      // Update avatar if not set
      if (avatar && !user.avatar) {
        updateData.avatar = avatar;
      }

      // Mark email as verified for OAuth users
      if (!user.isEmailVerified) {
        updateData.isEmailVerified = true;
      }

      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }

      this.logger.log(`Existing user logged in via ${provider}: ${email}`);
      return user;
    }

    // Create new user
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Create user
        const newUser = await tx.user.create({
          data: {
            id: uuidv4(),
            email,
            firstName,
            lastName,
            avatar,
            role: UserRole.CUSTOMER,
            isActive: true,
            isEmailVerified: true, // OAuth users have verified emails
            googleId: provider === 'google' ? providerId : undefined,
            appleId: provider === 'apple' ? providerId : undefined,
          },
        });

        // Create customer profile
        await tx.customerProfile.create({
          data: {
            id: uuidv4(),
            userId: newUser.id,
          },
        });

        return newUser;
      });

      this.logger.log(`New user created via ${provider}: ${email}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to create OAuth user:', error);
      throw new BadRequestException('Failed to create user account');
    }
  }

  /**
   * Link OAuth provider to existing user
   */
  async linkOAuthProvider(userId: string, provider: 'google' | 'apple', providerId: string): Promise<void> {
    try {
      const updateData = provider === 'google' 
        ? { googleId: providerId }
        : { appleId: providerId };

      await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      this.logger.log(`${provider} account linked to user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to link ${provider} account:`, error);
      throw new BadRequestException(`Failed to link ${provider} account`);
    }
  }

  /**
   * Unlink OAuth provider from user
   */
  async unlinkOAuthProvider(userId: string, provider: 'google' | 'apple'): Promise<void> {
    try {
      const updateData = provider === 'google' 
        ? { googleId: null }
        : { appleId: null };

      await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      this.logger.log(`${provider} account unlinked from user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to unlink ${provider} account:`, error);
      throw new BadRequestException(`Failed to unlink ${provider} account`);
    }
  }
}