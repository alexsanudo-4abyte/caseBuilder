import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Roles(Role.ATTORNEY, Role.INTAKE_STAFF, Role.CASE_MANAGER)
  search(@Query('q') q: string) {
    if (!q || q.trim().length < 2) {
      throw new BadRequestException('Query must be at least 2 characters');
    }
    return this.searchService.search(q.trim());
  }
}
