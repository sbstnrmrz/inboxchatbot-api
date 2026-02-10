import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Membership,
  MembershipDocument,
  MembershipStatus,
} from '../tenants/schemas/membership.schema.js';
import { UpdateMembershipDto } from './dto/update-membership.dto.js';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectModel(Membership.name)
    private readonly membershipModel: Model<MembershipDocument>,
  ) {}

  async createForTenant(tenantId: string): Promise<MembershipDocument> {
    const membership = new this.membershipModel({
      tenantId: new Types.ObjectId(tenantId),
      status: MembershipStatus.Active,
    });
    return membership.save();
  }

  async findByTenant(tenantId: string): Promise<MembershipDocument> {
    const membership = await this.membershipModel
      .findOne({ tenantId: new Types.ObjectId(tenantId) })
      .lean()
      .exec();

    if (!membership) {
      throw new NotFoundException(
        `Membership for tenant "${tenantId}" not found`,
      );
    }

    return membership;
  }

  async updateStatus(
    tenantId: string,
    dto: UpdateMembershipDto,
  ): Promise<MembershipDocument> {
    const membership = await this.membershipModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
    });

    if (!membership) {
      throw new NotFoundException(
        `Membership for tenant "${tenantId}" not found`,
      );
    }

    if (membership.status === dto.status) {
      throw new BadRequestException(
        `Membership is already in status "${dto.status}"`,
      );
    }

    membership.status = dto.status;

    if (dto.reason) membership.reason = dto.reason;

    if (dto.statusChangedBy) {
      membership.statusChangedBy = new Types.ObjectId(dto.statusChangedBy);
    }

    return membership.save();
  }

  async isActive(tenantId: string): Promise<boolean> {
    const membership = await this.membershipModel
      .findOne({ tenantId: new Types.ObjectId(tenantId) })
      .lean()
      .exec();

    return membership?.status === MembershipStatus.Active;
  }
}
