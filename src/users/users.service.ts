import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { auth } from '../lib/auth';
import { TenantsService } from '../tenants/tenants.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly tenantsService: TenantsService) {}

  async create(createUserDto: CreateUserDto, headers: Headers) {
    const {
      tenantId: tenantIdOrSlug,
      name,
      email,
      password,
      role,
    } = createUserDto;
    const tenantId = await this.tenantsService.resolveId(tenantIdOrSlug);

    const result = await auth.api.createUser({
      body: {
        name,
        email,
        password,
        role: role ?? 'user',
        data: { tenantId },
      },
      headers,
    });

    if (!result) {
      throw new BadRequestException('Failed to create user');
    }

    return result;
  }

  async findAll(headers: Headers) {
    const result = await auth.api.listUsers({
      query: {
        filterField: 'role',
        filterOperator: 'ne',
        filterValue: 'superadmin',
      },
      headers,
    });

    return result;
  }

  async findOne(id: string, headers: Headers) {
    const result = await auth.api.listUsers({
      query: {
        filterField: 'id',
        filterOperator: 'eq',
        filterValue: id,
        limit: 1,
      },
      headers,
    });

    if (!result?.users?.length) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return result.users[0];
  }

  async update(id: string, updateUserDto: UpdateUserDto, headers: Headers) {
    const result = await auth.api.adminUpdateUser({
      body: {
        userId: id,
        data: updateUserDto,
      },
      headers,
    });

    if (!result) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return result;
  }

  async remove(id: string, headers: Headers) {
    const result = await auth.api.removeUser({
      body: { userId: id },
      headers,
    });

    if (!result) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return result;
  }
}
