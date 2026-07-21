import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google ID token from OAuth sign-in' })
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}
