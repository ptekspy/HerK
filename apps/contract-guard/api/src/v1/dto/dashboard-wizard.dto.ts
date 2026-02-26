import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';

const ACKNOWLEDGEABLE_STEPS = ['policy_reviewed', 'notifications_reviewed'] as const;

function toOptionalBoolean(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true' || value === '1') {
    return true;
  }

  if (value === 'false' || value === '0') {
    return false;
  }

  return value;
}

export class UpdateDashboardWizardStateDto {
  @IsOptional()
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean()
  dismissed?: boolean;

  @IsOptional()
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean()
  markSeen?: boolean;

  @IsOptional()
  @IsIn(ACKNOWLEDGEABLE_STEPS)
  acknowledgeStepId?: (typeof ACKNOWLEDGEABLE_STEPS)[number];

  @IsOptional()
  @IsIn(ACKNOWLEDGEABLE_STEPS)
  clearAcknowledgeStepId?: (typeof ACKNOWLEDGEABLE_STEPS)[number];
}
