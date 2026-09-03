import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for PATCH /auth/profile — update user name and phone.
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  full_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
