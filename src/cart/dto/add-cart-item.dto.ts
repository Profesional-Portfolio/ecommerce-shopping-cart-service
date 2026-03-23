import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
} from 'class-validator';

export class AddCartItemDto {
  @IsString()
  @IsNotEmpty()
  cartId!: string; // the guest UUID or user ID

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  quantity?: number; // defaults to 1 if not provided
}
