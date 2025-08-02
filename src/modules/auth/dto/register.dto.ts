import { 
  IsEmail, 
  IsString, 
  IsPhoneNumber, 
  IsEnum, 
  IsOptional, 
  MinLength, 
  MaxLength, 
  Matches,
  IsObject,
  ValidateNested,
  IsNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

// Salon Owner specific registration data
export class SalonOwnerRegistrationDto {
  @ApiProperty({ description: 'Salon name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  salonName: string;

  @ApiProperty({ description: 'Salon address' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  salonAddress: string;

  @ApiProperty({ description: 'Salon city' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  salonCity: string;

  @ApiProperty({ description: 'Salon country' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  salonCountry: string;

  @ApiProperty({ description: 'Salon phone number' })
  @IsPhoneNumber()
  salonPhone: string;

  @ApiProperty({ description: 'Salon email' })
  @IsEmail()
  salonEmail: string;

  @ApiPropertyOptional({ description: 'Salon website' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  salonWebsite?: string;

  @ApiPropertyOptional({ description: 'Salon description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  salonDescription?: string;
}

export class RegisterDto {
  @ApiProperty({ 
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ 
    description: 'User password - minimum 8 characters with at least one uppercase, lowercase, number and special character',
    example: 'SecurePassword123!'
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain at least one uppercase letter, lowercase letter, number and special character' }
  )
  password: string;

  @ApiProperty({ 
    description: 'User first name',
    example: 'John'
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName: string;

  @ApiProperty({ 
    description: 'User last name',
    example: 'Doe'
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName: string;

  @ApiPropertyOptional({ 
    description: 'User phone number',
    example: '+1234567890'
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone?: string;

  @ApiProperty({ 
    description: 'User role',
    enum: UserRole,
    example: UserRole.CUSTOMER
  })
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role: UserRole;

  @ApiPropertyOptional({ 
    description: 'Additional data for salon owner registration',
    type: SalonOwnerRegistrationDto
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SalonOwnerRegistrationDto)
  salonData?: SalonOwnerRegistrationDto;
}