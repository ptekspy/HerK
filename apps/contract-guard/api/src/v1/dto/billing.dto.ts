import { IsIn, IsOptional, IsUrl } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsOptional()
  @IsIn(['STARTER', 'GROWTH', 'ENTERPRISE'])
  plan?: 'STARTER' | 'GROWTH' | 'ENTERPRISE';

  @IsOptional()
  @IsUrl()
  successUrl?: string;

  @IsOptional()
  @IsUrl()
  cancelUrl?: string;
}
