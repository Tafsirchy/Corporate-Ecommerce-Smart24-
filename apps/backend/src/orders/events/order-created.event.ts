import { Order } from '@prisma/client';

export class OrderCreatedEvent {
  constructor(
    public readonly order: Order,
    public readonly cartId: string,
    public readonly userId?: string,
    public readonly guestEmail?: string,
    public readonly guestName?: string,
  ) {}
}
