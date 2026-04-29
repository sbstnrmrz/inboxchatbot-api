import {
  Controller,
  Get,
  Param,
  Res,
  Request,
  HttpStatus,
} from '@nestjs/common';
import type { Response, Request as ExpressRequest } from 'express';
import * as fs from 'fs';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { FilesService } from './files.service.js';

/**
 * Serves locally cached media files to the front-end.
 *
 * Route: GET /files/:channel/:mediaType/:mediaId
 *
 * Authentication is handled by the global AuthGuard from
 * @thallesp/nestjs-better-auth, which is applied to all routes
 * by default. Tenant isolation is enforced by matching the
 * tenantId from the session against the requested resource.
 *
 * Examples:
 *   GET /files/whatsapp/image/wamid.ABC123
 *   GET /files/instagram/video/mid.XYZ789
 *   GET /files/client/image/1743520000000-abc1234
 */
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Public file serving for Instagram outbound media.
   * Instagram's servers need to fetch agent-uploaded images before sending them
   * to users — they cannot carry a session cookie, so this route is unauthenticated.
   * The tenantId in the path provides namespace isolation.
   *
   * GET /files/public/:tenantId/:channel/:mediaType/:mediaId
   */
  @Get('public/:tenantId/:channel/:mediaType/:mediaId')
  @AllowAnonymous()
  async servePublicFile(
    @Param('tenantId') tenantId: string,
    @Param('channel') channel: string,
    @Param('mediaType') mediaType: string,
    @Param('mediaId') mediaId: string,
    @Res() res: Response,
  ): Promise<void> {
    const file = this.filesService.getLocalFile(
      tenantId,
      channel.toLowerCase(),
      mediaType.toLowerCase(),
      mediaId,
    );

    const stat = fs.statSync(file.filePath);

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');

    const stream = fs.createReadStream(file.filePath);
    stream.pipe(res);
  }

  @Get(':channel/:mediaType/:mediaId')
  async serveFile(
    @Param('channel') channel: string,
    @Param('mediaType') mediaType: string,
    @Param('mediaId') mediaId: string,
    @Request()
    req: ExpressRequest & {
      tenantId?: string;
      session?: { user?: { tenantId?: string } };
    },
    @Res() res: Response,
  ): Promise<void> {
    // Resolve tenantId from middleware-injected value or session
    const tenantId = req.tenantId ?? (req as any).session?.user?.tenantId;

    if (!tenantId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Tenant not resolved' });
      return;
    }

    const file = this.filesService.getLocalFile(
      tenantId,
      channel.toLowerCase(),
      mediaType.toLowerCase(),
      mediaId,
    );

    const stat = fs.statSync(file.filePath);

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', stat.size);
    // Allow browser caching for 7 days — media files are immutable
    res.setHeader('Cache-Control', 'private, max-age=604800, immutable');

    const stream = fs.createReadStream(file.filePath);
    stream.pipe(res);
  }
}
