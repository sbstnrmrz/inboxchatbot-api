import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

export enum MediaChannel {
  WhatsApp = 'whatsapp',
  Instagram = 'instagram',
}

export interface DownloadedFile {
  /** Absolute path on disk */
  filePath: string;
  /** MIME type (e.g. image/jpeg) */
  mimeType: string;
  /** File size in bytes */
  size: number;
}

/**
 * Handles downloading, caching, and serving media files from
 * WhatsApp Cloud API and Instagram Graph API.
 *
 * Storage layout:
 *   {uploadsDir}/{tenantId}/{channel}/{mediaType}/{mediaId}.{ext}
 *
 * e.g. uploads/abc123/whatsapp/image/wamid.ABC.jpeg
 */
@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadsDir: string;

  constructor(private readonly configService: ConfigService) {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    this.uploadsDir =
      this.configService.get<string>('UPLOADS_DIR') ??
      (isProduction ? '/app/uploads' : 'uploads');
    this.logger.log(`Uploads dir: ${this.uploadsDir}`);
    this.ensureUploadsDir();
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Downloads WhatsApp media by its media ID.
   * Checks local cache first — if already downloaded, returns the cached file.
   *
   * @param tenantId   Tenant ObjectId string (for directory isolation)
   * @param mediaId    WhatsApp media ID (e.g. from message.media.whatsappMediaId)
   * @param mediaType  Normalized type slug: "image" | "video" | "audio" | etc.
   * @param accessToken WhatsApp Cloud API access token for this tenant
   */
  async downloadWhatsAppMedia(
    tenantId: string,
    mediaId: string,
    mediaType: string,
    accessToken: string,
  ): Promise<DownloadedFile> {
    // 1. Check cache
    const cached = this.findCachedFile(
      tenantId,
      MediaChannel.WhatsApp,
      mediaType,
      mediaId,
    );
    if (cached) {
      this.logger.debug(`[WA] Cache hit: ${cached.filePath}`);
      return cached;
    }

    // 2. Retrieve media URL from WhatsApp Cloud API
    const metaRes = await fetch(`https://graph.facebook.com/v23.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!metaRes.ok) {
      throw new InternalServerErrorException(
        `WhatsApp media metadata fetch failed: ${metaRes.status}`,
      );
    }

    const meta = (await metaRes.json()) as {
      url: string;
      mime_type: string;
      file_size: number;
      id: string;
    };

    // 3. Download the actual binary from the signed URL
    return this.downloadAndSave(
      tenantId,
      MediaChannel.WhatsApp,
      mediaType,
      mediaId,
      meta.url,
      meta.mime_type,
      meta.file_size,
      accessToken,
    );
  }

  /**
   * Downloads Instagram media from a direct CDN URL.
   * Checks local cache first — if already downloaded, returns the cached file.
   *
   * @param tenantId  Tenant ObjectId string
   * @param mediaId   Unique identifier to use as filename (e.g. message mid or attachment hash)
   * @param mediaType Normalized type slug: "image" | "video" | "audio" | etc.
   * @param url       Direct CDN URL to the media asset
   * @param mimeType  MIME type of the asset
   */
  async downloadInstagramMedia(
    tenantId: string,
    mediaId: string,
    mediaType: string,
    url: string,
    mimeType: string,
  ): Promise<DownloadedFile> {
    // 1. Check cache
    const cached = this.findCachedFile(
      tenantId,
      MediaChannel.Instagram,
      mediaType,
      mediaId,
    );
    if (cached) {
      this.logger.debug(`[IG] Cache hit: ${cached.filePath}`);
      return cached;
    }

    // 2. Download directly from CDN (no auth header needed for IG CDN URLs)
    return this.downloadAndSave(
      tenantId,
      MediaChannel.Instagram,
      mediaType,
      mediaId,
      url,
      mimeType,
      undefined,
      undefined,
    );
  }

  /**
   * Resolves a locally cached file and returns its path + mime type.
   * Throws NotFoundException if the file does not exist on disk.
   *
   * @param tenantId  Tenant ObjectId string
   * @param channel   "whatsapp" | "instagram"
   * @param mediaType Normalized type slug
   * @param mediaId   Media identifier used during download
   */
  getLocalFile(
    tenantId: string,
    channel: string,
    mediaType: string,
    mediaId: string,
  ): DownloadedFile {
    const cached = this.findCachedFile(
      tenantId,
      channel as MediaChannel,
      mediaType,
      mediaId,
    );
    if (!cached) {
      throw new NotFoundException(
        `Media not found: channel=${channel} mediaType=${mediaType} mediaId=${mediaId}`,
      );
    }
    return cached;
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Scans the tenant/channel/mediaType directory for a file whose stem matches
   * the mediaId. Returns metadata if found, undefined otherwise.
   */
  private findCachedFile(
    tenantId: string,
    channel: MediaChannel,
    mediaType: string,
    mediaId: string,
  ): DownloadedFile | undefined {
    const dir = this.buildDir(tenantId, channel, mediaType);

    if (!fs.existsSync(dir)) return undefined;

    const entries = fs.readdirSync(dir);
    // File is stored as `{mediaId}.{ext}` — match by stem
    const match = entries.find((f) => {
      const stem = path.parse(f).name;
      return stem === mediaId;
    });

    if (!match) return undefined;

    const filePath = path.join(dir, match);
    const stat = fs.statSync(filePath);
    const mimeType = this.mimeFromExtension(path.extname(match).slice(1));

    return { filePath, mimeType, size: stat.size };
  }

  /**
   * Downloads the binary at `url` and persists it under the correct directory.
   * Uses Node.js streams to avoid loading the entire file into memory.
   */
  private async downloadAndSave(
    tenantId: string,
    channel: MediaChannel,
    mediaType: string,
    mediaId: string,
    url: string,
    mimeType: string,
    size: number | undefined,
    accessToken: string | undefined,
  ): Promise<DownloadedFile> {
    const ext = this.extensionFromMime(mimeType);
    const dir = this.buildDir(tenantId, channel, mediaType);
    fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${mediaId}.${ext}`);

    this.logger.log(
      `Downloading ${channel} media mediaId=${mediaId} → ${filePath}`,
    );

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Use Node.js http/https to stream the binary to disk
    await this.streamUrlToDisk(url, filePath, headers);

    const stat = fs.statSync(filePath);

    return {
      filePath,
      mimeType,
      size: size ?? stat.size,
    };
  }

  /**
   * Streams a URL response directly to disk without buffering the full body.
   * Handles HTTP redirects (up to 5 hops) which WhatsApp CDN URLs use.
   */
  private streamUrlToDisk(
    url: string,
    dest: string,
    headers: Record<string, string>,
    redirectsLeft = 5,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (redirectsLeft === 0) {
        return reject(new Error('Too many redirects while downloading media'));
      }

      const parsedUrl = new URL(url);
      const transport = parsedUrl.protocol === 'https:' ? https : http;

      const req = transport.get(url, { headers }, (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          // Follow redirect
          return resolve(
            this.streamUrlToDisk(
              res.headers.location,
              dest,
              headers,
              redirectsLeft - 1,
            ),
          );
        }

        if (!res.statusCode || res.statusCode >= 400) {
          return reject(
            new Error(`HTTP ${res.statusCode} while downloading media`),
          );
        }

        const fileStream = fs.createWriteStream(dest);
        pipeline(res as unknown as Readable, fileStream)
          .then(resolve)
          .catch((err) => {
            // Clean up partial file on error
            fs.unlink(dest, () => {});
            reject(err);
          });
      });

      req.on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    });
  }

  /** Builds the directory path for a given tenant/channel/mediaType combo */
  private buildDir(
    tenantId: string,
    channel: MediaChannel | string,
    mediaType: string,
  ): string {
    return path.join(this.uploadsDir, tenantId, channel, mediaType);
  }

  /** Maps a MIME type to a file extension */
  private extensionFromMime(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'video/mp4': 'mp4',
      'video/3gpp': '3gp',
      'video/quicktime': 'mov',
      'audio/ogg': 'ogg',
      'audio/mpeg': 'mp3',
      'audio/mp4': 'm4a',
      'audio/aac': 'aac',
      'application/pdf': 'pdf',
      'image/sticker': 'webp',
    };
    return map[mimeType] ?? 'bin';
  }

  /** Maps a file extension back to a MIME type (for serving cached files) */
  private mimeFromExtension(ext: string): string {
    const map: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      mp4: 'video/mp4',
      '3gp': 'video/3gpp',
      mov: 'video/quicktime',
      ogg: 'audio/ogg',
      mp3: 'audio/mpeg',
      m4a: 'audio/mp4',
      aac: 'audio/aac',
      pdf: 'application/pdf',
      bin: 'application/octet-stream',
    };
    return map[ext] ?? 'application/octet-stream';
  }

  /** Creates the root uploads directory if it does not exist */
  private ensureUploadsDir(): void {
    fs.mkdirSync(this.uploadsDir, { recursive: true });
  }
}
