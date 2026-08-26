import { IsEnum, IsOptional, IsString } from 'class-validator';

/**
 * DTO for POST /auth/sync — called by the frontend after Firebase login
 * to upsert the user record in Postgres.
 */
export class SyncUserDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(['tenant', 'landlord'])
  role?: 'tenant' | 'landlord';
}
