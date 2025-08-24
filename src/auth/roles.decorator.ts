// src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../users/enums/role.enum';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);