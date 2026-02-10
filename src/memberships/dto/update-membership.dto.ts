import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { MembershipStatus } from '../../tenants/schemas/membership.schema.js';

export class UpdateMembershipDto {
  @IsEnum(MembershipStatus)
  status: MembershipStatus;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  reason?: string;

  @IsMongoId()
  @IsOptional()
  statusChangedBy?: string;
}
