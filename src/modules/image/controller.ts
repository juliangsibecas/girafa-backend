import {
  Controller,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { S3Service } from '../../core/s3';
import { JwtAuthGuard } from '../auth/jwt/guard';
import { LoggerService } from '../logger';

@Controller('images')
export class ImageController {
  constructor(private s3: S3Service, private logger: LoggerService) {}

  @Post('user-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @Request() req: Request & { user: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      this.logger.debug({
        path: 'UploadProfilePicture',
        data: { id: req.user },
      });
      await this.s3.uploadUserPicture(req.user, file);
    } catch (e) {
      this.logger.error({
        path: 'UploadProfilePicture',
        data: { id: req.user, ...e },
      });
    }
  }

  @Post('party-picture/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPartyPicture(
    @Param() { id }: { id: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    // TODO: verify user is organizer
    try {
      this.logger.debug({ path: 'UploadPartyPicture', data: { id } });
      await this.s3.uploadPartyPicture(id, file);
    } catch (e) {
      this.logger.error({ path: 'UploadPartyPicture', data: { id, ...e } });
    }
  }
}
