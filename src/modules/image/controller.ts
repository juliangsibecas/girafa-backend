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

@Controller('images')
export class ImageController {
  constructor(private s3: S3Service) {}

  @Post('profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @Request() req: Request & { user: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.s3.uploadUserPicture(req.user, file);
  }

  @Post('party-picture/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPartyPicture(
    @Param() { id }: { id: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    // TODO: verify user is organizer
    console.log(id);
    await this.s3.uploadPartyPicture(id, file);
  }
}
