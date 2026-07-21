import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { Roles } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PrismaService } from '../../prisma/prisma.service';
import {
  isStorageCategory,
  type StorageCategory,
} from './constants/storage-categories';
import { CompleteUploadDto, PresignUploadDto } from './dto/upload.dto';
import { StorageService } from './storage.service';

@ApiTags('Uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('uploads')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  private parseCategory(value?: string): StorageCategory {
    if (!value || !isStorageCategory(value)) {
      throw new BadRequestException(
        'Invalid or missing category. Use: videos, thumbnails, banners, resources, speakers',
      );
    }
    return value;
  }

  @Post('presign')
  @Roles(RoleName.ADMIN, RoleName.TEAM)
  @ApiOperation({ summary: 'Get presigned upload URL (or local multipart hint)' })
  async presign(@Body() dto: PresignUploadDto) {
    const category = this.parseCategory(dto.category);
    const presigned = await this.storageService.getPresignedUploadUrl(
      category,
      dto.fileName,
      dto.mimeType,
      dto.expiresIn,
    );

    return {
      data: {
        ...presigned,
        url: this.storageService.getUrl(presigned.path),
      },
    };
  }

  @Post('file')
  @Roles(RoleName.ADMIN, RoleName.TEAM)
  @ApiOperation({ summary: 'Upload file to local storage' })
  @ApiQuery({ name: 'category', required: true, enum: ['videos', 'thumbnails', 'banners', 'resources', 'speakers'] })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string },
    @Query('category') categoryParam?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const category = this.parseCategory(categoryParam);
    const result = await this.storageService.uploadMultipart(file, category);

    return {
      data: {
        path: result.path,
        key: result.path,
        url: result.url,
        mimeType: result.mimeType,
        sizeBytes: result.sizeBytes,
        provider: result.provider,
      },
    };
  }

  @Post('complete')
  @Roles(RoleName.ADMIN, RoleName.TEAM)
  @ApiOperation({ summary: 'Confirm upload and create attachment record' })
  async complete(@Body() dto: CompleteUploadDto) {
    const attachment = await this.prisma.attachment.create({
      data: {
        fileName: dto.fileName,
        fileKey: dto.key,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        storageProvider: this.storageService.getProviderName(),
      },
    });

    return {
      data: {
        ...attachment,
        url: this.storageService.getUrl(attachment.fileKey),
      },
    };
  }
}
