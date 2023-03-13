import { registerEnumType } from '@nestjs/graphql';

export enum UserGender {
  'FEMALE' = 'FEMALE',
  'MALE' = 'MALE',
  'OTHER' = 'OTHER',
}

registerEnumType(UserGender, {
  name: 'UserGender',
});
