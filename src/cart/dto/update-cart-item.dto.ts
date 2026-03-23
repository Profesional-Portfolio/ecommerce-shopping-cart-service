import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class UpdateCartItemDto {
  @IsString()
  @IsNotEmpty()
  cartId!: string;

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @IsPositive()
  quantity!: number;
}
