import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRepositoryDto {
  @IsString()
  @IsNotEmpty()
  owner!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  githubInstallationId!: string;

  @IsString()
  @IsOptional()
  defaultBranch?: string;
}

export class UpdateRepositoryDto {
  @IsString()
  @IsOptional()
  defaultBranch?: string;
}
