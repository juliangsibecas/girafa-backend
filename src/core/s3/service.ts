import * as AWS from 'aws-sdk';
import * as sharp from 'sharp';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  constructor(private config: ConfigService) {}

  s3 = new AWS.S3({
    s3ForcePathStyle: true,
    accessKeyId: this.config.get('s3.accessKeyId'),
    secretAccessKey: this.config.get('s3.secretAccessKey'),
    endpoint: new AWS.Endpoint(this.config.get('s3.endpoint')),
  });

  async uploadUserPicture(userId: string, file: Express.Multer.File) {
    const buffer = await sharp(file.buffer).jpeg().toBuffer();

    await this.upload('user-pictures', `${userId}.jpeg`, {
      ...file,
      buffer,
    });
  }

  async uploadPartyPicture(partyId: string, file: Express.Multer.File) {
    const buffer = await sharp(file.buffer).jpeg().toBuffer();

    await this.upload('party-pictures', `${partyId}.jpeg`, {
      ...file,
      buffer,
    });
  }

  async upload(folder: string, fileName: string, file: Express.Multer.File) {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.config.get('s3.name'),
      Key: `${folder}/${fileName}`,
      Body: file.buffer,
    };

    await this.s3.upload(params).promise();
  }
}
