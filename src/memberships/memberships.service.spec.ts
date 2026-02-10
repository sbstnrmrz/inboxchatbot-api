import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MembershipsService } from './memberships.service';
import {
  Membership,
  MembershipDocument,
  MembershipSchema,
  MembershipStatus,
} from '../tenants/schemas/membership.schema';
import { rootMongooseTestModule, closeTestDb } from '../utils/test-db.helper';

jest.setTimeout(60000);

// A reusable fake tenantId for tests
const TENANT_ID = new Types.ObjectId().toHexString();
const OTHER_TENANT_ID = new Types.ObjectId().toHexString();

describe('MembershipsService', () => {
  let service: MembershipsService;
  let membershipModel: Model<MembershipDocument>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: Membership.name, schema: MembershipSchema },
        ]),
      ],
      providers: [MembershipsService],
    }).compile();

    service = module.get<MembershipsService>(MembershipsService);
    membershipModel = module.get<Model<MembershipDocument>>(
      getModelToken(Membership.name),
    );
  });

  afterEach(async () => {
    await membershipModel.deleteMany({});
  });

  afterAll(async () => {
    await closeTestDb();
  });

  // ---------------------------------------------------------------------------
  // createForTenant
  // ---------------------------------------------------------------------------

  describe('createForTenant', () => {
    it('should create a membership with ACTIVE status', async () => {
      const membership = await service.createForTenant(TENANT_ID);

      expect(membership).toBeDefined();
      expect(membership.status).toBe(MembershipStatus.Active);
      expect(String(membership.tenantId)).toBe(TENANT_ID);
    });

    it('should set statusChangedAt on creation via pre-save hook', async () => {
      const membership = await service.createForTenant(TENANT_ID);

      // Mongoose considers the initial status set as a modification,
      // so the pre-save hook fires and sets statusChangedAt
      expect(membership.statusChangedAt).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // findByTenant
  // ---------------------------------------------------------------------------

  describe('findByTenant', () => {
    it('should return the membership for a tenant', async () => {
      await service.createForTenant(TENANT_ID);
      const membership = await service.findByTenant(TENANT_ID);

      expect(membership).toBeDefined();
      expect(String(membership.tenantId)).toBe(TENANT_ID);
    });

    it('should throw NotFoundException for unknown tenantId', async () => {
      await expect(
        service.findByTenant(new Types.ObjectId().toHexString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  // updateStatus
  // ---------------------------------------------------------------------------

  describe('updateStatus', () => {
    it('should suspend an active membership', async () => {
      await service.createForTenant(TENANT_ID);

      const updated = await service.updateStatus(TENANT_ID, {
        status: MembershipStatus.Suspended,
        reason: 'Non-payment',
      });

      expect(updated.status).toBe(MembershipStatus.Suspended);
      expect(updated.reason).toBe('Non-payment');
      expect(updated.suspendedAt).toBeDefined();
      expect(updated.statusChangedAt).toBeDefined();
    });

    it('should disable an active membership', async () => {
      await service.createForTenant(TENANT_ID);

      const updated = await service.updateStatus(TENANT_ID, {
        status: MembershipStatus.Disabled,
      });

      expect(updated.status).toBe(MembershipStatus.Disabled);
      expect(updated.disabledAt).toBeDefined();
    });

    it('should reactivate a suspended membership', async () => {
      await service.createForTenant(TENANT_ID);
      await service.updateStatus(TENANT_ID, {
        status: MembershipStatus.Suspended,
      });

      const reactivated = await service.updateStatus(TENANT_ID, {
        status: MembershipStatus.Active,
      });

      expect(reactivated.status).toBe(MembershipStatus.Active);
      expect(reactivated.reactivatedAt).toBeDefined();
    });

    it('should throw BadRequestException when updating to the same status', async () => {
      await service.createForTenant(TENANT_ID);

      await expect(
        service.updateStatus(TENANT_ID, { status: MembershipStatus.Active }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for unknown tenantId', async () => {
      await expect(
        service.updateStatus(new Types.ObjectId().toHexString(), {
          status: MembershipStatus.Suspended,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  // isActive
  // ---------------------------------------------------------------------------

  describe('isActive', () => {
    it('should return true for an active membership', async () => {
      await service.createForTenant(TENANT_ID);

      expect(await service.isActive(TENANT_ID)).toBe(true);
    });

    it('should return false for a suspended membership', async () => {
      await service.createForTenant(TENANT_ID);
      await service.updateStatus(TENANT_ID, {
        status: MembershipStatus.Suspended,
      });

      expect(await service.isActive(TENANT_ID)).toBe(false);
    });

    it('should return false for a disabled membership', async () => {
      await service.createForTenant(TENANT_ID);
      await service.updateStatus(TENANT_ID, {
        status: MembershipStatus.Disabled,
      });

      expect(await service.isActive(TENANT_ID)).toBe(false);
    });

    it('should return false when no membership exists', async () => {
      expect(await service.isActive(OTHER_TENANT_ID)).toBe(false);
    });
  });
});
