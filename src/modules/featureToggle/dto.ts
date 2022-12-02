import { FeatureToggleName } from './types';

export class FeatureTogglePopulateDto {
  value?: boolean;
}

export class FeatureToggleChangeValueDto {
  name: FeatureToggleName;
  value: boolean;
}
