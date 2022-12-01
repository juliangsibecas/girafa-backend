import { SetMetadata } from '@nestjs/common';

import { ROLES_KEY } from './constant';
import { Role } from './types';

export const Roles = (roles: Array<Role>) => SetMetadata(ROLES_KEY, { roles });
