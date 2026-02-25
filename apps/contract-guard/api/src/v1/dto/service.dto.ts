import { ContractSourceType } from '@herk/api';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  repositoryId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsIn(['GITHUB_FILE', 'PUBLIC_URL'])
  contractSourceType!: ContractSourceType;

  @ValidateIf((value: CreateServiceDto) => value.contractSourceType === 'GITHUB_FILE')
  @IsString()
  @IsNotEmpty()
  contractPath?: string;

  @ValidateIf((value: CreateServiceDto) => value.contractSourceType === 'PUBLIC_URL')
  @IsString()
  @IsNotEmpty()
  contractUrlTemplate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  contractPath?: string | null;

  @IsOptional()
  @IsString()
  contractUrlTemplate?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
