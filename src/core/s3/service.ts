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

  async deleteUserPicture(pictureId: string) {
    await this.s3
      .deleteObject({
        Bucket: this.config.get('s3.name'),
        Key: `user-pictures/${pictureId}.jpeg`,
      })
      .promise();
  }

  async uploadUserPicture(pictureId: string, file: Express.Multer.File) {
    const buffer = await sharp(file.buffer).jpeg().toBuffer();

    return this.upload('user-pictures', `${pictureId}.jpeg`, {
      ...file,
      buffer,
    });
  }

  async uploadPartyPicture(partyId: string, file: Express.Multer.File) {
    const buffer = await sharp(file.buffer).jpeg().toBuffer();

    return this.upload('party-pictures', `${partyId}.jpeg`, {
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

    return this.s3.upload(params).promise();
  }
}
