import { TestHelpers } from './helpers';
import { Params } from './types';

export class TestSuite extends TestHelpers {
  constructor(params: Params) {
    super(params);
  }

  async generateAccessTokens() {
    super.tokens = await Promise.all(
      this.users.map(async (user) => {
        const res = await this.signIn(user.email);

        return res.data.accessToken;
      }),
    );
  }
}
