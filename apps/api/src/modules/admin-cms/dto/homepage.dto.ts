import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class HomepageSectionInputDto {
  @ApiProperty({ example: 'welcome' })
  @IsString()
  id!: string;

  @ApiProperty({ example: 'Welcome' })
  @IsString()
  title!: string;

  @ApiProperty()
  @IsBoolean()
  visible!: boolean;

  @ApiProperty()
  @IsInt()
  @Min(0)
  order!: number;
}

export class UpdateHomepageLayoutDto {
  @ApiProperty({ type: [HomepageSectionInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => HomepageSectionInputDto)
  sections!: HomepageSectionInputDto[];
}
