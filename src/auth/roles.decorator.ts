// src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/users/enums/role.enum';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);