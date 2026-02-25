import { MemberRole } from '@herk/api';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsEmail()
  email!: string;

  @IsIn(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'])
  role!: MemberRole;

  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateMemberDto {
  @IsIn(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'])
  role!: MemberRole;
}
