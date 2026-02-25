import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUserContext } from '../common/auth/current-user.decorator';
import { SessionGuard } from '../common/auth/session.guard';
import type { CurrentUser } from '../common/auth/current-user.type';

import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { V1Service } from './v1.service';

@Controller('v1/orgs/:orgId/services')
@UseGuards(SessionGuard)
export class ServicesController {
  constructor(private readonly v1Service: V1Service) {}

  @Get()
  async list(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
  ): Promise<unknown> {
    return this.v1Service.listServices(user.id, orgId);
  }

  @Post()
  async create(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Body() dto: CreateServiceDto,
  ) {
    return this.v1Service.createService(user.id, orgId, dto);
  }

  @Patch(':serviceId')
  async update(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.v1Service.updateService(user.id, orgId, serviceId, dto);
  }

  @Delete(':serviceId')
  async remove(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Param('serviceId') serviceId: string,
  ) {
    return this.v1Service.deleteService(user.id, orgId, serviceId);
  }
}
