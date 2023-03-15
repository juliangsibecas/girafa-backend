import * as AWS from 'aws-sdk';
import * as sharp from 'sharp';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Environment } from '../../common/types';

@Injectable()
export class S3Service {
  constructor(private config: ConfigService) {}

  s3 = new AWS.S3({
    s3ForcePathStyle: true,
    accessKeyId: this.config.get('s3.accessKeyId'),
    secretAccessKey: this.config.get('s3.secretAccessKey'),
    endpoint: new AWS.Endpoint(this.config.get('s3.endpoint')),
  });

  populate(files: Array<Express.Multer.File>) {
    if (process.env.NODE_ENV === Environment.DEVELOPMENT) {
      return Promise.all(
        files.map((file, i) =>
          this.s3
            .upload({
              Bucket: this.config.get('s3.name'),
              Key: `opera/female/${i}.jpeg`,
              Body: file.buffer,
            })
            .promise(),
        ),
      );
    }
  }

  async assignOperaPictures(
    femalePictureIds: Array<string>,
    malePictureIds: Array<string>,
  ) {
    const femalesPictures = await this.s3
      .listObjects({
        Bucket: this.config.get('s3.name'),
        Prefix: 'opera/female/',
      })
      .promise();

    const malesPictures = await this.s3
      .listObjects({
        Bucket: this.config.get('s3.name'),
        Prefix: 'opera/male/',
      })
      .promise();

    await Promise.all([
      Promise.all(
        femalePictureIds.map(async (pictureId, i) => {
          if (femalesPictures.Contents[i]) {
            const file = await this.s3
              .getObject({
                Bucket: this.config.get('s3.name'),
                Key: `opera/female/${i}.jpeg`,
              })
              .promise();

            const buffer = await sharp(file.Body as Buffer)
              .jpeg()
              .resize(1080, 1920, { fit: 'cover' })
              .toBuffer();

            return this.upload('user-pictures', `${pictureId}.jpeg`, buffer);
          }

          return Promise.resolve();
        }),
      ),
      Promise.all(
        malePictureIds.map(async (pictureId, i) => {
          if (malesPictures.Contents[i]) {
            const file = await this.s3
              .getObject({
                Bucket: this.config.get('s3.name'),
                Key: `opera/male/${i}.jpeg`,
              })
              .promise();

            const buffer = await sharp(file.Body as Buffer)
              .jpeg()
              .resize(1080, 1920, { fit: 'cover' })
              .toBuffer();

            return this.upload('user-pictures', `${pictureId}.jpeg`, buffer);
          }

          return Promise.resolve();
        }),
      ),
    ]);
  }

  async deleteUserPicture(pictureId: string) {
    await this.s3
      .deleteObject({
        Bucket: this.config.get('s3.name'),
        Key: `user-pictures/${pictureId}.jpeg`,
      })
      .promise();
  }

  async deleteUserBanner(bannerId: string) {
    await this.s3
      .deleteObject({
        Bucket: this.config.get('s3.name'),
        Key: `user-banners/${bannerId}.jpeg`,
      })
      .promise();
  }

  async uploadUserPicture(pictureId: string, file: Express.Multer.File) {
    const buffer = await sharp(file.buffer)
      .jpeg()
      .resize(1000, 1000, { fit: 'cover' })
      .toBuffer();

    return this.upload('user-pictures', `${pictureId}.jpeg`, buffer);
  }

  async uploadUserBanner(bannerId: string, file: Express.Multer.File) {
    const buffer = await sharp(file.buffer)
      .jpeg()
      .resize(1080, 1920, { fit: 'cover' })
      .toBuffer();

    return this.upload('user-banners', `${bannerId}.jpeg`, buffer);
  }

  async uploadPartyPicture(partyId: string, file: Express.Multer.File) {
    const buffer = await sharp(file.buffer).jpeg().toBuffer();

    return this.upload('party-pictures', `${partyId}.jpeg`, buffer);
  }

  async upload(folder: string, fileName: string, buffer: Buffer) {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.config.get('s3.name'),
      Key: `${folder}/${fileName}`,
      Body: buffer,
    };

    return this.s3.upload(params).promise();
  }
}
