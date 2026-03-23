import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { RedisService } from '../modules/redis/redis.service';
import { PRODUCT_SERVICE } from '../modules/config';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItemDto } from './dto/cart-item.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  private readonly CART_PREFIX = 'cart:';

  constructor(
    private readonly redisService: RedisService,
    @Inject(PRODUCT_SERVICE) private readonly productClient: ClientProxy,
  ) {}

  private getCartKey(cartId: string): string {
    return `${this.CART_PREFIX}${cartId}`;
  }

  async getCart(
    cartId: string,
  ): Promise<{ id: string; items: CartItemDto[]; total: number }> {
    const data = await this.redisService.get(this.getCartKey(cartId));
    if (!data) {
      return { id: cartId, items: [], total: 0 };
    }
    const cart = JSON.parse(data) as {
      id: string;
      items: CartItemDto[];
      total: number;
    };
    return cart;
  }

  async addItem(
    dto: AddCartItemDto,
  ): Promise<{ id: string; items: CartItemDto[]; total: number }> {
    const { cartId, productId, quantity = 1 } = dto;

    let product:
      | { id: string; name: string; price: number; stock: number }
      | undefined;
    try {
      product = await firstValueFrom<{
        id: string;
        name: string;
        price: number;
        stock: number;
      }>(
        this.productClient.send({ cmd: 'find.one.product' }, { id: productId }),
      );
    } catch (e) {
      this.logger.error(`Error fetching product ${productId}:`, e);
      throw new RpcException({
        status: 500,
        message: 'Could not connect to product service or product erro',
      });
    }

    if (!product) {
      throw new RpcException({
        status: 404,
        message: 'Product not found',
      });
    }

    if (product.stock < quantity) {
      throw new RpcException({
        status: 409,
        message: `Insufficient stock. Available: ${product.stock}`,
      });
    }

    const cart = await this.getCart(cartId);
    const existingItem = cart.items.find(
      (item) => item.productId === productId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;

      if (product.stock < existingItem.quantity) {
        throw new RpcException({
          status: 409,
          message: 'Insufficient stock to add this much.',
        });
      }
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    return this.saveCart(cartId, cart.items);
  }

  async updateItem(
    dto: UpdateCartItemDto,
  ): Promise<{ id: string; items: CartItemDto[]; total: number }> {
    const { cartId, productId, quantity } = dto;

    const cart = await this.getCart(cartId);
    const item = cart.items.find((i) => i.productId === productId);

    if (!item) {
      throw new RpcException('Item not found in cart');
    }

    if (quantity <= 0) {
      return this.removeItem(cartId, productId);
    }

    // Checking stock again
    let product:
      | { id: string; name: string; price: number; stock: number }
      | undefined;
    try {
      product = await firstValueFrom<{
        id: string;
        name: string;
        price: number;
        stock: number;
      }>(
        this.productClient.send({ cmd: 'find.one.product' }, { id: productId }),
      );
    } catch (e) {
      this.logger.error(`Error validating product ${productId}:`, e);
    }

    if (product && product.stock < quantity) {
      throw new RpcException({
        status: 409,
        message: `Insufficient stock. Available: ${product.stock}`,
      });
    }

    item.quantity = quantity;
    return this.saveCart(cartId, cart.items);
  }

  async removeItem(
    cartId: string,
    productId: string,
  ): Promise<{ id: string; items: CartItemDto[]; total: number }> {
    const cart = await this.getCart(cartId);
    cart.items = cart.items.filter((item) => item.productId !== productId);
    return this.saveCart(cartId, cart.items);
  }

  async clearCart(cartId: string): Promise<void> {
    await this.redisService.del(this.getCartKey(cartId));
  }

  private async saveCart(
    cartId: string,
    items: CartItemDto[],
  ): Promise<{ id: string; items: CartItemDto[]; total: number }> {
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const cart = { id: cartId, items, total };

    // Set expiry to 7 days
    await this.redisService.set(
      this.getCartKey(cartId),
      JSON.stringify(cart),
      'EX',
      60 * 60 * 24 * 7,
    );
    return cart;
  }
}
