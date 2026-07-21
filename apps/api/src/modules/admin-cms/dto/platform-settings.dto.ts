import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePlatformSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homepageBannerTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homepageBannerSubtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homepageBannerImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  themeAccent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultCompetencyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emailWelcomeTemplate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyNewSession?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyApproval?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featureQa?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featureBookmarks?: boolean;
}
