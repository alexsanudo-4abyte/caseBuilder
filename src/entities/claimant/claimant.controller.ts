import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CrudController } from '../../shared/crud.controller';
import { ClaimantEntity } from './claimant.entity';
import { ClaimantService } from './claimant.service';
import { CreateClaimantDto, UpdateClaimantDto } from './dto/claimant.dto';

@Controller('claimants')
export class ClaimantController extends CrudController<ClaimantEntity> {
  constructor(readonly service: ClaimantService) {
    super(service);
  }

  @Post()
  create(@Body() dto: CreateClaimantDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClaimantDto) {
    return this.service.update(id, dto);
  }
}
