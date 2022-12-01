import { SetMetadata } from '@nestjs/common';
import { FEATURE_TOGGLE_KEY } from './constant';
import { FeatureToggleMetadata, FeatureToggleName } from './types';

export const Features = (names: Array<FeatureToggleName>) =>
  SetMetadata<typeof FEATURE_TOGGLE_KEY, FeatureToggleMetadata>(
    FEATURE_TOGGLE_KEY,
    { names },
  );
