import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MeetStatus, SessionDifficulty } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum MeetLibrarySort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  POPULAR = 'popular',
}

export class ListMeetsQueryDto extends PaginationDto {
  /** @deprecated Event-era filter. Ignored for library listing; only published recordings are returned. */
  @ApiPropertyOptional({ enum: MeetStatus, deprecated: true })
  @IsOptional()
  @IsEnum(MeetStatus)
  status?: MeetStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  competencyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  speakerId?: string;

  @ApiPropertyOptional({ description: 'Filter by session year' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: SessionDifficulty })
  @IsOptional()
  @IsEnum(SessionDifficulty)
  difficulty?: SessionDifficulty;

  @ApiPropertyOptional({ description: 'Filter by tag name' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ enum: MeetLibrarySort, default: MeetLibrarySort.NEWEST })
  @IsOptional()
  @IsEnum(MeetLibrarySort)
  sort?: MeetLibrarySort;
}
