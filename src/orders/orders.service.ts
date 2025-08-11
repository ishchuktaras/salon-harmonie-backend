// src/orders/orders.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // Vytvoří novou objednávku (tuto metodu už máme)
  async create(createOrderDto: CreateOrderDto) {
    const { clientId, items } = createOrderDto;

    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(`Produkt s ID ${item.productId} nebyl nalezen.`);
      }
      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(`Nedostatek kusů na skladě pro produkt: ${product.name}.`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      const total = items.reduce((sum, item) => {
        const product = productMap.get(item.productId);
        if (!product) throw new Error('Interní chyba: Produkt nenalezen při výpočtu ceny.');
        return sum + product.price * item.quantity;
      }, 0);

      const order = await tx.order.create({
        data: {
          clientId,
          total,
          items: {
            create: items.map((item) => {
              const product = productMap.get(item.productId);
              if (!product) throw new Error('Interní chyba: Produkt nenalezen při vytváření položek.');
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
              };
            }),
          },
        },
        include: {
          items: true,
        },
      });

      return order;
    });
  }

  // Zobrazí všechny objednávky (pro admina)
  findAll() {
    return this.prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        client: { select: { firstName: true, lastName: true } },
      },
      orderBy: {
        createdAt: 'desc', // Seřadíme od nejnovějších
      },
    });
  }

  // Zobrazí detail jedné objednávky
  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        client: true,
      },
    });
    if (!order) {
      throw new NotFoundException(`Objednávka s ID ${id} nebyla nalezena.`);
    }
    return order;
  }

  // Upraví stav objednávky
  update(id: number, updateOrderDto: UpdateOrderDto) {
    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
    });
  }

  // Mazání objednávek prozatím nebudeme implementovat, je to složitější operace
  // (co se má stát se skladovými zásobami atd.)
  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
