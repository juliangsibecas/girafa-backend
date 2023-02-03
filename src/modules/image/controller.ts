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
import { v4 } from 'uuid';

import { S3Service } from '../../core/s3';
import { JwtAuthGuard } from '../auth/jwt/guard';
import { LoggerService } from '../logger';
import { UserDocument } from '../user/schema';

@Controller('images')
export class ImageController {
  constructor(private s3: S3Service, private logger: LoggerService) {}

  @Post('user-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @Request() req: Request & { user: UserDocument },
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const newId = v4();
      const lastId = req.user.pictureId;

      req.user.pictureId = newId;

      await Promise.all([
        req.user.save(),
        this.s3.deleteUserPicture(lastId),
        this.s3.uploadUserPicture(newId, file),
      ]);
    } catch (e) {
      this.logger.error({
        path: 'UploadProfilePicture',
        data: { user: req.user, ...e },
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
      await this.s3.uploadPartyPicture(id, file);
    } catch (e) {
      this.logger.error({ path: 'UploadPartyPicture', data: { id, ...e } });
    }
  }
}
