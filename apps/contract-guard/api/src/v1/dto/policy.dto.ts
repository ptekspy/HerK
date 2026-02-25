import { IsBoolean, IsObject, IsOptional } from 'class-validator';

export class UpdatePolicyDto {
  @IsOptional()
  @IsBoolean()
  failOnBreaking?: boolean;

  @IsOptional()
  @IsObject()
  ruleOverrides?: Record<string, 'OFF' | 'WARN' | 'BLOCK'>;
}
