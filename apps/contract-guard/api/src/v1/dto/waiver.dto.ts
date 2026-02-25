import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateWaiverDto {
  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsString()
  repositoryId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  pullRequestNumber?: number;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsDateString()
  expiresAt!: string;
}

export class UpdateWaiverDto {
  @IsOptional()
  @IsString()
  serviceId?: string | null;

  @IsOptional()
  @IsString()
  repositoryId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  pullRequestNumber?: number | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
