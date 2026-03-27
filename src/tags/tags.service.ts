import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tag, TagDocument } from './schemas/tag.schema.js';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto.js';
import {
  Conversation,
  ConversationDocument,
} from '../conversations/schemas/conversation.schema.js';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name)
    private readonly tagModel: Model<TagDocument>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async create(tenantId: string, dto: CreateTagDto): Promise<TagDocument> {
    const tenantObjectId = new Types.ObjectId(tenantId);

    const existing = await this.tagModel
      .findOne({ tenantId: tenantObjectId, name: dto.name })
      .lean()
      .exec();

    if (existing) {
      throw new ConflictException(`Tag "${dto.name}" already exists`);
    }

    const tag = new this.tagModel({
      tenantId: tenantObjectId,
      name: dto.name,
      color: dto.color ?? '#6B7280',
    });

    return tag.save() as Promise<TagDocument>;
  }

  async findAll(tenantId: string): Promise<TagDocument[]> {
    const tenantObjectId = new Types.ObjectId(tenantId);

    return this.tagModel
      .find({ tenantId: tenantObjectId })
      .sort({ name: 1 })
      .lean()
      .exec() as Promise<TagDocument[]>;
  }

  async update(
    tenantId: string,
    tagId: string,
    dto: UpdateTagDto,
  ): Promise<TagDocument> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const tagObjectId = new Types.ObjectId(tagId);

    if (dto.name) {
      const conflict = await this.tagModel
        .findOne({
          tenantId: tenantObjectId,
          name: dto.name,
          _id: { $ne: tagObjectId },
        })
        .lean()
        .exec();

      if (conflict) {
        throw new ConflictException(`Tag "${dto.name}" already exists`);
      }
    }

    const updated = await this.tagModel
      .findOneAndUpdate(
        { _id: tagObjectId, tenantId: tenantObjectId },
        { $set: dto },
        { new: true },
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Tag ${tagId} not found`);
    }

    return updated as TagDocument;
  }

  async findOrCreateByNames(
    tenantId: string,
    tags: { name: string; color?: string }[],
  ): Promise<Types.ObjectId[]> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const ids: Types.ObjectId[] = [];
    const validHexColor = /^#[0-9a-fA-F]{6}$/;
    const defaultColor = '#6B7280';

    for (const { name, color } of tags) {
      const resolvedColor =
        color && validHexColor.test(color) ? color : defaultColor;
      const tag = await this.tagModel
        .findOneAndUpdate(
          { tenantId: tenantObjectId, name },
          { $setOnInsert: { tenantId: tenantObjectId, name, color: resolvedColor } },
          { upsert: true, new: true },
        )
        .lean()
        .exec();

      ids.push((tag as TagDocument)._id as Types.ObjectId);
    }

    return ids;
  }

  async remove(tenantId: string, tagId: string): Promise<{ tagId: string }> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const tagObjectId = new Types.ObjectId(tagId);

    const deleted = await this.tagModel
      .findOneAndDelete({ _id: tagObjectId, tenantId: tenantObjectId })
      .lean()
      .exec();

    if (!deleted) {
      throw new NotFoundException(`Tag ${tagId} not found`);
    }

    await this.conversationModel
      .updateMany(
        { tenantId: tenantObjectId, tags: tagObjectId },
        { $pull: { tags: tagObjectId } },
      )
      .exec();

    return { tagId };
  }
}
