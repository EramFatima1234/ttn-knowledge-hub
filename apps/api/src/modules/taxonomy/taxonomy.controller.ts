import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/auth.decorators';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Taxonomy')
@Controller()
export class TaxonomyController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('competencies')
  @ApiOperation({ summary: 'List competencies' })
  async competencies() {
    const data = await this.prisma.competency.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return { data };
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'List categories' })
  async categories() {
    const data = await this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return { data };
  }
}
