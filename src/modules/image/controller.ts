import {
  Controller,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { S3Service } from '../../core/s3';
import { JwtAuthGuard } from '../auth/jwt/guard';

@Controller('images')
export class ImageController {
  constructor(private s3: S3Service) {}

  @Post('profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadProfilePicture(
    @Request() req: Request & { user: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.s3.uploadProfilePicture(req.user, file);
  }

  @Post('party-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadPartyPicture(
    @Request() req: Request & { user: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.s3.uploadProfilePicture(req.user, file);
  }
}
