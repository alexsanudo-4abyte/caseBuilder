import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Request,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { IntakeGatewayService } from './intake-gateway.service';
import { PublicIntakeDto } from './dto/public-intake.dto';
import { AddConversationDto } from './dto/add-conversation.dto';

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

  @Get('submissions/:id/documents')
  @Roles(Role.CLAIMANT)
  getDocuments(
    @Param('id') id: string,
    @Request() req: { user: { userId: string; email: string } },
  ) {
    return this.intakeGatewayService.getDocumentsForSubmission(
      id,
      req.user.userId,
      req.user.email,
    );
  }

  @Post('submissions/:id/documents')
  @Roles(Role.CLAIMANT)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) =>
          cb(null, `${crypto.randomUUID()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  uploadDocument(
    @Param('id') id: string,
    @Request() req: { user: { userId: string; email: string } },
    @UploadedFile() file: Express.Multer.File,
    @Query('document_type') documentType: string,
  ) {
    return this.intakeGatewayService.uploadDocument(
      id,
      req.user.userId,
      req.user.email,
      file,
      documentType,
    );
  }

  @Patch('submissions/:id/conversation')
  @Roles(Role.CLAIMANT)
  updateConversation(
    @Param('id') id: string,
    @Request() req: { user: { userId: string; email: string } },
    @Body() dto: AddConversationDto,
  ) {
    return this.intakeGatewayService.updateConversation(
      id,
      req.user.userId,
      req.user.email,
      dto.conversation,
    );
  }
}
