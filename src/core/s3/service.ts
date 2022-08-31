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

  async uploadUserPicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<boolean> {
    const buffer = await sharp(file.buffer).jpeg().toBuffer();

    try {
      return await this.upload('user-pictures', `${userId}.jpeg`, {
        ...file,
        buffer,
      });
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async uploadPartyPicture(
    partyId: string,
    file: Express.Multer.File,
  ): Promise<boolean> {
    const buffer = await sharp(file.buffer).jpeg().toBuffer();

    try {
      console.log('triggered');
      return await this.upload('party-pictures', `${partyId}.jpeg`, {
        ...file,
        buffer,
      });
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async upload(
    bucketName: string,
    fileName: string,
    file: Express.Multer.File,
  ): Promise<boolean> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
    };

    try {
      await this.s3.upload(params).promise();
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
