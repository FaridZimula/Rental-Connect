import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPropertiesDto {
  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsEnum(['rent', 'lease', 'sale'])
  listing_type?: string;

  @IsOptional()
  @IsEnum([
    'apartment',
    'house',
    'studio',
    'hostel',
    'commercial',
    'land',
    'vehicle',
    'machinery',
    'event_equipment',
    'event_venue',
    'agro_machinery',
    'medical_equipment',
    'solar_power',
    'fashion_attire',
    'it_hardware',
    'watercraft',
    'camping_sports',
  ])
  property_type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_max?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
