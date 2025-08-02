import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  GoogleOAuthDto,
  AppleOAuthDto,
  RefreshTokenDto,
} from './dto';
import {
  AuthResponseDto,
  RefreshResponseDto,
} from './dto/auth-response.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Register a new user account. Customers can register freely, salon owners must provide salon data, staff and admin accounts cannot self-register.'
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or invalid role',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - user already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - staff or admin cannot self-register',
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`Registration attempt for email: ${registerDto.email}, role: ${registerDto.role}`);
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Login user',
    description: 'Authenticate user with email and password'
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - account deactivated',
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Generate new access token using refresh token'
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<RefreshResponseDto> {
    this.logger.log('Token refresh attempt');
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Logout user',
    description: 'Logout user and invalidate refresh tokens'
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  async logout(
    @CurrentUser() user: any,
    @Body() body?: { refreshToken?: string }
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Logout attempt for user: ${user.id}`);
    return this.authService.logout(user.id, body?.refreshToken);
  }

  @Public()
  @Post('oauth/google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Google OAuth authentication',
    description: 'Authenticate user with Google OAuth token'
  })
  @ApiResponse({
    status: 200,
    description: 'Google authentication successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid Google token',
  })
  @ApiBody({ type: GoogleOAuthDto })
  async googleOAuth(@Body() googleOAuthDto: GoogleOAuthDto): Promise<AuthResponseDto> {
    this.logger.log('Google OAuth authentication attempt');
    return this.authService.googleOAuth(googleOAuthDto);
  }

  @Public()
  @Post('oauth/apple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Apple OAuth authentication',
    description: 'Authenticate user with Apple OAuth identity token'
  })
  @ApiResponse({
    status: 200,
    description: 'Apple authentication successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid Apple token',
  })
  @ApiBody({ type: AppleOAuthDto })
  async appleOAuth(@Body() appleOAuthDto: AppleOAuthDto): Promise<AuthResponseDto> {
    this.logger.log('Apple OAuth authentication attempt');
    return this.authService.appleOAuth(appleOAuthDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Get the profile of the currently authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string', nullable: true },
            avatar: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['CUSTOMER', 'SALON_OWNER', 'STAFF', 'ADMIN'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  async getProfile(@CurrentUser() user: any) {
    this.logger.log(`Profile request for user: ${user.id}`);
    return {
      success: true,
      user: {
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
      },
    };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Check authentication status',
    description: 'Verify if the current token is valid'
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication status',
    schema: {
      type: 'object',
      properties: {
        authenticated: { type: 'boolean' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token',
  })
  async checkStatus(@CurrentUser() user: any) {
    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}