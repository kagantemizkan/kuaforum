import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoogleOAuthDto {
  @ApiProperty({ 
    description: 'Google OAuth access token',
    example: 'ya29.a0ARrdaM9...'
  })
  @IsString()
  @IsNotEmpty({ message: 'Google access token is required' })
  accessToken: string;

  @ApiPropertyOptional({ 
    description: 'Google OAuth ID token',
    example: 'eyJhbGciOiJSUzI1NiIs...'
  })
  @IsOptional()
  @IsString()
  idToken?: string;
}

export class AppleOAuthDto {
  @ApiProperty({ 
    description: 'Apple OAuth identity token',
    example: 'eyJraWQiOiJlWGF1bm1MIiwiYWxnIjoiUlMyNTYifQ...'
  })
  @IsString()
  @IsNotEmpty({ message: 'Apple identity token is required' })
  identityToken: string;

  @ApiPropertyOptional({ 
    description: 'Apple OAuth authorization code',
    example: 'c6a9d4c8e7f4b2d3a1e5f8c9b2d4e7f1a3c5e8f9b2d4e7f1a3c5e8f9'
  })
  @IsOptional()
  @IsString()
  authorizationCode?: string;

  @ApiPropertyOptional({ 
    description: 'User email from Apple (only provided on first sign-in)',
    example: 'user@privaterelay.appleid.com'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ 
    description: 'User first name from Apple (only provided on first sign-in)',
    example: 'John'
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ 
    description: 'User last name from Apple (only provided on first sign-in)',
    example: 'Doe'
  })
  @IsOptional()
  @IsString()
  lastName?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ 
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}