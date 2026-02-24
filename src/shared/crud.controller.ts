import {
  Body,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CrudService } from './crud.service';

export abstract class CrudController<T extends { id: string }> {
  constructor(private readonly service: CrudService<T>) {}

  @Get()
  findAll(@Query() query: Record<string, string>) {
    const { sort, limit, ...filters } = query;
    const limitNum = limit ? +limit : undefined;
    if (Object.keys(filters).length) {
      return this.service.filter(filters as any, sort, limitNum);
    }
    return this.service.list(sort, limitNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() body: Partial<T>) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<T>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
