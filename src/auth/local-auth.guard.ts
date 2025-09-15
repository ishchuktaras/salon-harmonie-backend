import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Tento Guard jednoduše spustí logiku spojenou s 'local' strategií,
 * kterou jsme právě definovali v local.strategy.ts.
 * Budeme ho používat pouze na jednom místě - na našem /auth/login endpointu.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
