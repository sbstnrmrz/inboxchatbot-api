import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Tenant, TenantDocument } from './schemas/tenant.schema.js';
import { CreateTenantDto } from './dto/create-tenant.dto.js';
import { UpdateTenantDto } from './dto/update-tenant.dto.js';
import { MembershipsService } from '../memberships/memberships.service.js';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
    private readonly membershipsService: MembershipsService,
  ) {}
  private readonly logger = new Logger(TenantsService.name);

  async create(createTenantDto: CreateTenantDto): Promise<TenantDocument> {
    const existing = await this.tenantModel
      .findOne({ slug: createTenantDto.slug })
      .lean()
      .exec();

    if (existing) {
      throw new ConflictException(
        `A tenant with slug "${createTenantDto.slug}" already exists`,
      );
    }

    const tenant = new this.tenantModel(createTenantDto);
    const saved = await tenant.save();
    this.logger.log(`Tenant Created Successfully ✅`);
    this.logger.log(saved);

    await this.membershipsService.createForTenant(String(saved._id));

    return saved;
  }

  async findAll(): Promise<TenantDocument[]> {
    return this.tenantModel
      .find({ slug: { $ne: 'system' } })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<TenantDocument> {
    const tenant = await this.tenantModel.findById(id).lean().exec();

    if (!tenant) {
      throw new NotFoundException(`Tenant with id "${id}" not found`);
    }

    return tenant;
  }

  async findBySlug(slug: string): Promise<TenantDocument> {
    const tenant = await this.tenantModel.findOne({ slug }).lean().exec();

    if (!tenant) {
      throw new NotFoundException(`Tenant with slug "${slug}" not found`);
    }

    return tenant;
  }

  async getSlugById(id: string): Promise<string> {
    const tenant = await this.tenantModel
      .findById(id)
      .select('slug')
      .lean()
      .exec();

    if (!tenant) {
      throw new NotFoundException(`Tenant with id "${id}" not found`);
    }

    return tenant.slug;
  }

  async resolveId(idOrSlug: string): Promise<string> {
    if (isValidObjectId(idOrSlug)) {
      const tenant = await this.findOne(idOrSlug);
      return String(tenant._id);
    }

    const tenant = await this.findBySlug(idOrSlug);
    return String(tenant._id);
  }

  async update(
    id: string,
    updateTenantDto: UpdateTenantDto,
  ): Promise<TenantDocument> {
    if (updateTenantDto.slug) {
      const conflict = await this.tenantModel
        .findOne({ slug: updateTenantDto.slug, _id: { $ne: id } })
        .lean()
        .exec();

      if (conflict) {
        throw new ConflictException(
          `A tenant with slug "${updateTenantDto.slug}" already exists`,
        );
      }
    }

    const updated = await this.tenantModel
      .findByIdAndUpdate(id, updateTenantDto, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Tenant with id "${id}" not found`);
    }

    this.logger.log(
      `Tenant with ID ${updated._id.toString()} Updated Succesfully`,
    );
    this.logger.log(updated);

    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.tenantModel.findByIdAndDelete(id).lean().exec();

    if (!result) {
      throw new NotFoundException(`Tenant with id "${id}" not found`);
    }

    await this.membershipsService.deleteByTenant(id);

    return { deleted: true };
  }
}
