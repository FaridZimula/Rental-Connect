import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateLeadDto {
  @IsUUID()
  property_id: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  buyer_message?: string;
}
