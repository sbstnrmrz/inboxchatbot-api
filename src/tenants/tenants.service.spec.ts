import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { TenantsService } from './tenants.service';
import { Tenant, TenantDocument, TenantSchema } from './schemas/tenant.schema';
import { MembershipsService } from '../memberships/memberships.service';
import {
  Membership,
  MembershipSchema,
  MembershipStatus,
} from './schemas/membership.schema';
import { rootMongooseTestModule, closeTestDb } from '../utils/test-db.helper';
import { isEncrypted } from '../utils/encryption';

// Set encryption key for tests
process.env.ENCRYPTION_KEY = 'a'.repeat(64);

const BASE_DTO = {
  name: 'Acme Corp',
  slug: 'acme-corp',
};

const WHATSAPP_DTO = {
  accessToken: 'whatsapp-access-token',
  phoneNumberId: '111222333',
  businessAccountId: '444555666',
  appSecret: 'whatsapp-app-secret',
  webhookVerifyToken: 'my-verify-token',
};

const INSTAGRAM_DTO = {
  accessToken: 'instagram-access-token',
  accountId: '777888999',
  pageId: '123456789',
  appSecret: 'instagram-app-secret',
};

// Downloading the MongoDB binary on first run can take a while
jest.setTimeout(60000);

describe('TenantsService', () => {
  let service: TenantsService;
  let membershipsService: MembershipsService;
  let tenantModel: Model<TenantDocument>;
  let connection: Connection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: Tenant.name, schema: TenantSchema },
          { name: Membership.name, schema: MembershipSchema },
        ]),
      ],
      providers: [TenantsService, MembershipsService],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    membershipsService = module.get<MembershipsService>(MembershipsService);
    tenantModel = module.get<Model<TenantDocument>>(getModelToken(Tenant.name));
    connection = module.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    await tenantModel.deleteMany({});
    await connection.db!.collection('memberships').deleteMany({});
  });

  afterAll(async () => {
    await closeTestDb();
  });

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------

  describe('create', () => {
    it('should create a tenant with only name and slug', async () => {
      const tenant = await service.create(BASE_DTO);

      expect(tenant.name).toBe('Acme Corp');
      expect(tenant.slug).toBe('acme-corp');
      expect(tenant._id).toBeDefined();
    });

    it('should create an active membership when creating a tenant', async () => {
      const tenant = await service.create(BASE_DTO);
      const membership = await membershipsService.findByTenant(
        String(tenant._id),
      );

      expect(membership).toBeDefined();
      expect(membership.status).toBe(MembershipStatus.Active);
      expect(String(membership.tenantId)).toBe(String(tenant._id));
    });

    it('should create a tenant with whatsappInfo and return decrypted values', async () => {
      const tenant = await service.create({
        ...BASE_DTO,
        whatsappInfo: WHATSAPP_DTO,
      });

      expect(tenant.whatsappInfo).toBeDefined();
      expect(tenant.whatsappInfo!.accessToken).toBe(WHATSAPP_DTO.accessToken);
      expect(tenant.whatsappInfo!.appSecret).toBe(WHATSAPP_DTO.appSecret);
      expect(tenant.whatsappInfo!.webhookVerifyToken).toBe(
        WHATSAPP_DTO.webhookVerifyToken,
      );
      expect(tenant.whatsappInfo!.phoneNumberId).toBe(
        WHATSAPP_DTO.phoneNumberId,
      );
    });

    it('should create a tenant with instagramInfo and return decrypted values', async () => {
      const tenant = await service.create({
        ...BASE_DTO,
        instagramInfo: INSTAGRAM_DTO,
      });

      expect(tenant.instagramInfo).toBeDefined();
      expect(tenant.instagramInfo!.accessToken).toBe(INSTAGRAM_DTO.accessToken);
      expect(tenant.instagramInfo!.appSecret).toBe(INSTAGRAM_DTO.appSecret);
    });

    it('should store whatsappInfo sensitive fields encrypted in MongoDB', async () => {
      await service.create({ ...BASE_DTO, whatsappInfo: WHATSAPP_DTO });

      // Use the native driver to bypass all Mongoose post hooks
      const raw = await connection
        .db!.collection('tenants')
        .findOne({ slug: BASE_DTO.slug });

      expect(isEncrypted(raw!.whatsappInfo.accessToken)).toBe(true);
      expect(isEncrypted(raw!.whatsappInfo.appSecret)).toBe(true);
      expect(isEncrypted(raw!.whatsappInfo.webhookVerifyToken)).toBe(true);
      // Non-sensitive fields should NOT be encrypted
      expect(raw!.whatsappInfo.phoneNumberId).toBe(WHATSAPP_DTO.phoneNumberId);
    });

    it('should store instagramInfo sensitive fields encrypted in MongoDB', async () => {
      await service.create({ ...BASE_DTO, instagramInfo: INSTAGRAM_DTO });

      // Use the native driver to bypass all Mongoose post hooks
      const raw = await connection
        .db!.collection('tenants')
        .findOne({ slug: BASE_DTO.slug });

      expect(isEncrypted(raw!.instagramInfo.accessToken)).toBe(true);
      expect(isEncrypted(raw!.instagramInfo.appSecret)).toBe(true);
      // Non-sensitive fields should NOT be encrypted
      expect(raw!.instagramInfo.pageId).toBe(INSTAGRAM_DTO.pageId);
    });

    it('should throw ConflictException when slug already exists', async () => {
      await service.create(BASE_DTO);

      await expect(
        service.create({ ...BASE_DTO, name: 'Other Corp' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ---------------------------------------------------------------------------
  // findAll
  // ---------------------------------------------------------------------------

  describe('findAll', () => {
    it('should return all tenants sorted by createdAt DESC', async () => {
      await service.create({ name: 'First', slug: 'first' });
      await service.create({ name: 'Second', slug: 'second' });

      const tenants = await service.findAll();

      expect(tenants).toHaveLength(2);
      expect(tenants[0].slug).toBe('second');
      expect(tenants[1].slug).toBe('first');
    });

    it('should return empty array when no tenants exist', async () => {
      const tenants = await service.findAll();
      expect(tenants).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // findOne
  // ---------------------------------------------------------------------------

  describe('findOne', () => {
    it('should return a tenant by id', async () => {
      const created = await service.create(BASE_DTO);
      const found = await service.findOne(String(created._id));

      expect(String(found._id)).toBe(String(created._id));
      expect(found.slug).toBe(BASE_DTO.slug);
    });

    it('should throw NotFoundException for unknown id', async () => {
      await expect(service.findOne('000000000000000000000000')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // findBySlug
  // ---------------------------------------------------------------------------

  describe('findBySlug', () => {
    it('should return a tenant by slug', async () => {
      await service.create(BASE_DTO);
      const found = await service.findBySlug(BASE_DTO.slug);

      expect(found.slug).toBe(BASE_DTO.slug);
    });

    it('should throw NotFoundException for unknown slug', async () => {
      await expect(service.findBySlug('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------

  describe('update', () => {
    it('should update tenant name', async () => {
      const created = await service.create(BASE_DTO);
      const updated = await service.update(String(created._id), {
        name: 'Updated Corp',
      });

      expect(updated.name).toBe('Updated Corp');
      expect(updated.slug).toBe(BASE_DTO.slug);
    });

    it('should throw ConflictException when updating to an existing slug', async () => {
      const first = await service.create(BASE_DTO);
      await service.create({ name: 'Other', slug: 'other-slug' });

      await expect(
        service.update(String(first._id), { slug: 'other-slug' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException for unknown id', async () => {
      await expect(
        service.update('000000000000000000000000', { name: 'Ghost' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  // remove
  // ---------------------------------------------------------------------------

  describe('remove', () => {
    it('should delete a tenant and return { deleted: true }', async () => {
      const created = await service.create(BASE_DTO);
      const result = await service.remove(String(created._id));

      expect(result).toEqual({ deleted: true });
      await expect(service.findOne(String(created._id))).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for unknown id', async () => {
      await expect(service.remove('000000000000000000000000')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
