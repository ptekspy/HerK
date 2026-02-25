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

import { CreateRepositoryDto, UpdateRepositoryDto } from './dto/repo.dto';
import { V1Service } from './v1.service';

@Controller('v1/orgs/:orgId/repos')
@UseGuards(SessionGuard)
export class ReposController {
  constructor(private readonly v1Service: V1Service) {}

  @Get()
  async list(@CurrentUserContext() user: CurrentUser, @Param('orgId') orgId: string) {
    return this.v1Service.listRepos(user.id, orgId);
  }

  @Post()
  async create(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Body() dto: CreateRepositoryDto,
  ) {
    return this.v1Service.createRepo(user.id, orgId, dto);
  }

  @Patch(':repoId')
  async update(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Param('repoId') repoId: string,
    @Body() dto: UpdateRepositoryDto,
  ) {
    return this.v1Service.updateRepo(user.id, orgId, repoId, dto);
  }

  @Delete(':repoId')
  async remove(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Param('repoId') repoId: string,
  ) {
    return this.v1Service.deleteRepo(user.id, orgId, repoId);
  }
}
