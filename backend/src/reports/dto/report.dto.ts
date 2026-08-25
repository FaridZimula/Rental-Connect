import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  property_id: string;

  @IsEnum(['fraudulent', 'duplicate', 'outdated', 'misleading', 'other'])
  reason: 'fraudulent' | 'duplicate' | 'outdated' | 'misleading' | 'other';

  @IsOptional()
  @IsString()
  details?: string;
}

export class ResolveReportDto {
  @IsEnum(['reviewed', 'action_taken', 'dismissed'])
  status: 'reviewed' | 'action_taken' | 'dismissed';

  @IsOptional()
  @IsString()
  admin_notes?: string;
}
