import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

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
  property_type: string;

  @IsEnum(['rent', 'lease', 'sale'])
  listing_type: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  // Private — stored internally, never returned in public responses
  @IsString()
  @IsNotEmpty()
  real_address: string;

  @IsString()
  @IsNotEmpty()
  display_zone: string;

  @Type(() => Number)
  @IsNumber()
  real_lat: number;

  @Type(() => Number)
  @IsNumber()
  real_lng: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  bathrooms?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  area_sqft?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];
}
