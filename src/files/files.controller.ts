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
 */
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

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
      channel,
      mediaType,
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
