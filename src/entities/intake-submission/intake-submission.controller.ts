import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { IntakeSubmissionEntity } from './intake-submission.entity';
import { IntakeSubmissionService } from './intake-submission.service';
import { CreateIntakeSubmissionDto, UpdateIntakeSubmissionDto } from './dto/intake-submission.dto';

@Controller('intake-submissions')
export class IntakeSubmissionController extends CrudController<IntakeSubmissionEntity> {
  constructor(readonly service: IntakeSubmissionService) {
    super(service);
  }

  @Post()
  create(@Body() dto: CreateIntakeSubmissionDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIntakeSubmissionDto) {
    return this.service.update(id, dto);
  }
}
