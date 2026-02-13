import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { TenantsService } from './tenants.service';
import { logger } from 'better-auth';

@Injectable()
export class TenantsMiddleware implements NestMiddleware {
  constructor(private readonly tenantsService: TenantsService) {}
  private readonly logger = new Logger(TenantsMiddleware.name);

  async use(
    req: Request & { tenantId?: string },
    res: Response,
    next: NextFunction,
  ) {
    // 1. Try to resolve tenantId from the authenticated session (cookie-based)
    try {
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });
      if (session?.user?.tenantId) {
        req.tenantId = session.user.tenantId;
        return next();
      }
    } catch {
      // Session resolution failed — continue to subdomain fallback
    }

    // 2. Fallback: resolve tenantId from subdomain slug
    // e.g. "tenant1.localtest.me" → resolve slug "tenant1" to its ObjectId
    const host = req.hostname;
    const parts = host.split('.');
    if (parts.length > 2) {
      try {
        const tenantId = await this.tenantsService.resolveId(parts[0]);
        req.tenantId = tenantId;
      } catch {
        // Unknown slug — tenantId stays undefined
      }
    }

    next();
  }
}
