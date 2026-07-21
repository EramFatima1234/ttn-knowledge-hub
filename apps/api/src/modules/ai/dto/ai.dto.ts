import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AiDiscoverDto {
  @ApiProperty({ example: 'Show React sessions' })
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  prompt!: string;
}
