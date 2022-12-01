import { FeatureToggleName } from './types';

export class FeatureToggleCreateDto {
  name: FeatureToggleName;
  value: boolean;
}

export class FeatureToggleChangeValueDto {
  name: FeatureToggleName;
  value: boolean;
}

export class FeatureToggleDeleteDto {
  name: FeatureToggleName;
}
