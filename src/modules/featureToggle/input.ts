import { Field, InputType } from '@nestjs/graphql';

import { FeatureToggleName } from './types';

@InputType()
export class FeatureTogglePopulateInput {
  @Field({ nullable: true })
  value?: boolean;
}

@InputType()
export class FeatureToggleChangeValueInput {
  @Field(() => FeatureToggleName)
  name: FeatureToggleName;

  @Field()
  value: boolean;
}
