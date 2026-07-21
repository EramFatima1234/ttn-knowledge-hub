import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { STORAGE_CATEGORIES } from '../constants/storage-categories';

export class PresignUploadDto {
  @ApiProperty({ example: 'intro.mp4' })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({ example: 'video/mp4' })
  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @ApiProperty({ enum: STORAGE_CATEGORIES, example: 'videos' })
  @IsString()
  @IsIn([...STORAGE_CATEGORIES])
  category!: string;

  @ApiPropertyOptional({ example: 3600 })
  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(86400)
  expiresIn?: number;
}

export class CompleteUploadDto {
  @ApiProperty({ description: 'Relative storage path, e.g. videos/uuid.mp4' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  sizeBytes!: number;
}
