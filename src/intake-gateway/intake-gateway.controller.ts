import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/public.decorator';
import { IntakeGatewayService } from './intake-gateway.service';
import { PublicIntakeDto } from './dto/public-intake.dto';

@Controller('intake')
export class IntakeGatewayController {
  constructor(private readonly intakeGatewayService: IntakeGatewayService) {}

  @Public()
  @Throttle({ global: { limit: 5, ttl: 900_000 } })
  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  submit(@Body() dto: PublicIntakeDto) {
    return this.intakeGatewayService.submit(dto);
  }
}
