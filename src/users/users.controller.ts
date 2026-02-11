import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Session() session: UserSession) {
    return { user: session.user };
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto, @Headers() headers: Headers) {
    return this.usersService.create(createUserDto, headers);
  }

  @Get()
  findAll(@Headers() headers: Headers) {
    return this.usersService.findAll(headers);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers() headers: Headers) {
    return this.usersService.findOne(id, headers);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Headers() headers: Headers,
  ) {
    return this.usersService.update(id, updateUserDto, headers);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers() headers: Headers) {
    return this.usersService.remove(id, headers);
  }
}
