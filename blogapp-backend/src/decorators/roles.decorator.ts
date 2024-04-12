import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/enum/role.enum';

export const ROLES_KEY = 'roles'; //defines the key under which metadata will be stored
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
