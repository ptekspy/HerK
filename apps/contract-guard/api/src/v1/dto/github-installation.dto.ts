import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class SyncGithubInstallationDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  installationId!: number;

  @IsString()
  @IsNotEmpty()
  accountLogin!: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'false') return false;
    if (value === '0') return false;
    return Boolean(value);
  })
  @IsBoolean()
  syncRepositories?: boolean;
}
