import { Test } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Customer,
  CustomerSchema,
  CustomerDocument,
} from './customer.schema.js';
import {
  rootMongooseTestModule,
  closeTestDb,
} from '../../utils/test-db.helper.js';

describe('CustomerSchema indexes', () => {
  let customerModel: Model<CustomerDocument>;

  const TENANT_ID = new Types.ObjectId();
  const OTHER_TENANT_ID = new Types.ObjectId();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: Customer.name, schema: CustomerSchema },
        ]),
      ],
    }).compile();

    customerModel = module.get<Model<CustomerDocument>>(
      getModelToken(Customer.name),
    );
  });

  afterAll(async () => {
    await closeTestDb();
  });

  afterEach(async () => {
    await customerModel.deleteMany({});
  });

  // ── WhatsApp customer ──────────────────────────────────────────────────────

  describe('customer with whatsappInfo (no instagramInfo)', () => {
    it('should create successfully', async () => {
      const customer = await customerModel.create({
        tenantId: TENANT_ID,
        name: 'Miguel Vivas',
        whatsappInfo: { id: '584147083834', name: 'Miguel Vivas' },
      });

      expect(customer._id).toBeDefined();
      expect(customer.instagramInfo).toBeUndefined();
    });

    it('should allow a second WA customer in the same tenant with a different wa_id', async () => {
      await customerModel.create({
        tenantId: TENANT_ID,
        name: 'Miguel Vivas',
        whatsappInfo: { id: '584147083834', name: 'Miguel Vivas' },
      });

      const second = await customerModel.create({
        tenantId: TENANT_ID,
        name: 'Sebastián Ramírez',
        whatsappInfo: { id: '584141112233', name: 'Sebastián Ramírez' },
      });

      expect(second._id).toBeDefined();
    });

    it('should reject a duplicate wa_id within the same tenant', async () => {
      await customerModel.create({
        tenantId: TENANT_ID,
        name: 'Miguel Vivas',
        whatsappInfo: { id: '584147083834', name: 'Miguel Vivas' },
      });

      await expect(
        customerModel.create({
          tenantId: TENANT_ID,
          name: 'Miguel Vivas (dup)',
          whatsappInfo: { id: '584147083834', name: 'Miguel Vivas (dup)' },
        }),
      ).rejects.toThrow(/duplicate key/);
    });

    it('should allow the same wa_id in a different tenant', async () => {
      await customerModel.create({
        tenantId: TENANT_ID,
        name: 'Miguel Vivas',
        whatsappInfo: { id: '584147083834', name: 'Miguel Vivas' },
      });

      const other = await customerModel.create({
        tenantId: OTHER_TENANT_ID,
        name: 'Miguel Vivas',
        whatsappInfo: { id: '584147083834', name: 'Miguel Vivas' },
      });

      expect(other._id).toBeDefined();
    });
  });

  // ── Instagram customer ─────────────────────────────────────────────────────

  describe('customer with instagramInfo (no whatsappInfo)', () => {
    it('should create successfully', async () => {
      const customer = await customerModel.create({
        tenantId: TENANT_ID,
        name: '1432252608656851',
        instagramInfo: { accountId: '1432252608656851' },
      });

      expect(customer._id).toBeDefined();
      expect(customer.whatsappInfo).toBeUndefined();
    });

    it('should allow a second IG customer in the same tenant with a different accountId', async () => {
      await customerModel.create({
        tenantId: TENANT_ID,
        name: '1432252608656851',
        instagramInfo: { accountId: '1432252608656851' },
      });

      const second = await customerModel.create({
        tenantId: TENANT_ID,
        name: '9876543210',
        instagramInfo: { accountId: '9876543210' },
      });

      expect(second._id).toBeDefined();
    });

    it('should reject a duplicate accountId within the same tenant', async () => {
      await customerModel.create({
        tenantId: TENANT_ID,
        name: '1432252608656851',
        instagramInfo: { accountId: '1432252608656851' },
      });

      await expect(
        customerModel.create({
          tenantId: TENANT_ID,
          name: '1432252608656851 (dup)',
          instagramInfo: { accountId: '1432252608656851' },
        }),
      ).rejects.toThrow(/duplicate key/);
    });

    it('should allow the same accountId in a different tenant', async () => {
      await customerModel.create({
        tenantId: TENANT_ID,
        name: '1432252608656851',
        instagramInfo: { accountId: '1432252608656851' },
      });

      const other = await customerModel.create({
        tenantId: OTHER_TENANT_ID,
        name: '1432252608656851',
        instagramInfo: { accountId: '1432252608656851' },
      });

      expect(other._id).toBeDefined();
    });
  });

  // ── Cross-channel coexistence ──────────────────────────────────────────────

  describe('WA and IG customers coexisting in the same tenant', () => {
    it('should allow a WA customer and an IG customer to exist in the same tenant without conflict', async () => {
      const wa = await customerModel.create({
        tenantId: TENANT_ID,
        name: 'WA User',
        whatsappInfo: { id: '584147083834', name: 'WA User' },
      });

      const ig = await customerModel.create({
        tenantId: TENANT_ID,
        name: 'IG User',
        instagramInfo: { accountId: '1432252608656851' },
      });

      expect(wa._id).toBeDefined();
      expect(ig._id).toBeDefined();
    });

    it('should allow multiple WA customers when IG customers also exist in the same tenant', async () => {
      await customerModel.create({
        tenantId: TENANT_ID,
        name: 'IG User',
        instagramInfo: { accountId: '1432252608656851' },
      });

      const wa1 = await customerModel.create({
        tenantId: TENANT_ID,
        name: 'WA User 1',
        whatsappInfo: { id: '584147083834', name: 'WA User 1' },
      });

      const wa2 = await customerModel.create({
        tenantId: TENANT_ID,
        name: 'WA User 2',
        whatsappInfo: { id: '584141112233', name: 'WA User 2' },
      });

      expect(wa1._id).toBeDefined();
      expect(wa2._id).toBeDefined();
    });
  });
});
