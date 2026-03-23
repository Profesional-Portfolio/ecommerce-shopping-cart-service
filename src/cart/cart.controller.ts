import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller()
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  @MessagePattern({ cmd: 'get.cart' })
  getCart(@Payload('cartId') cartId: string) {
    if (!cartId) {
      return { error: 'cartId is required' };
    }
    return this.cartService.getCart(cartId);
  }

  @MessagePattern({ cmd: 'add.cart.item' })
  addItem(@Payload() addCartItemDto: AddCartItemDto) {
    return this.cartService.addItem(addCartItemDto);
  }

  @MessagePattern({ cmd: 'update.cart.item' })
  updateItem(@Payload() updateCartItemDto: UpdateCartItemDto) {
    return this.cartService.updateItem(updateCartItemDto);
  }

  @MessagePattern({ cmd: 'remove.cart.item' })
  removeItem(@Payload() payload: { cartId: string; productId: string }) {
    if (!payload.cartId || !payload.productId) {
      return { error: 'cartId and productId are required' };
    }
    return this.cartService.removeItem(payload.cartId, payload.productId);
  }

  @MessagePattern({ cmd: 'clear.cart' })
  async clearCart(@Payload('cartId') cartId: string) {
    if (!cartId) {
      return { error: 'cartId is required' };
    }
    await this.cartService.clearCart(cartId);
    return { success: true };
  }
}
