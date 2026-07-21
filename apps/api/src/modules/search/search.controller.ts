import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { SearchService } from './search.service';
import { SearchQueryDto, SuggestionsQueryDto } from './dto/search-query.dto';

@ApiTags('Search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Full-text search across videos, meets, and series' })
  search(
    @Query() query: SearchQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.searchService.search(query, user.id);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Search autocomplete suggestions' })
  suggestions(@Query() query: SuggestionsQueryDto) {
    return this.searchService.suggestions(query.q, query.limit ?? 5);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Recent searches for current user' })
  recent(@CurrentUser() user: AuthenticatedUser) {
    return this.searchService.recent(user.id);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Popular searches (30 days)' })
  popular() {
    return this.searchService.popular();
  }

  @Get('trending')
  @ApiOperation({ summary: 'Trending searches (7 days)' })
  trending() {
    return this.searchService.trending();
  }
}
