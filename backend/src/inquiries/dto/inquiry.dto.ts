import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInquiryDto {
  @IsString()
  @IsNotEmpty()
  property_id: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsDateString()
  viewing_date?: string;
}

export class RespondInquiryDto {
  @IsString()
  @IsNotEmpty()
  response: string;
}
