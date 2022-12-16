import { registerEnumType } from '@nestjs/graphql';

export enum PartyAvailability {
  'PUBLIC' = 'PUBLIC',
  'FOLLOWERS' = 'FOLLOWERS',
  'FOLLOWING' = 'FOLLOWING',
  'PRIVATE' = 'PRIVATE',
}

registerEnumType(PartyAvailability, {
  name: 'PartyAvailability',
});

export enum PartyStatus {
  'CREATED' = 'CREATED',
  'ENABLED' = 'ENABLED',
  'EXPIRED' = 'EXPIRED',
}

registerEnumType(PartyStatus, {
  name: 'PartyStatus',
});
