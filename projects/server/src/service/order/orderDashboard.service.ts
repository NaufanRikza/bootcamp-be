import { orderStatusConstants, orderStatusList } from '../../config/orderConstants';
import Documents from '../../database/models/document.model';
import Order from '../../database/models/order.model';
import OrderDetail from '../../database/models/orderDetail.model';
import OrderStatus from '../../database/models/orderStatus.model';
import Product from '../../database/models/products.model';
import { BadRequestException } from '../../helper/Error/BadRequestException/BadRequestException';
import { OrderService } from './order.service';
import { OrderStatusService } from './orderStatus.service';
import { OrderStockService } from './orderStock.service';

export class OrderDashboardService {
  orderService: OrderService;
  orderStatusService: OrderStatusService;
  orderStockService: OrderStockService;

  constructor() {
    this.orderService = new OrderService();
    this.orderStatusService = new OrderStatusService();
    this.orderStockService = new OrderStockService();
  }

  async updateStatusOrder(newStatus: string, orderId: number, branchId: number) {
    console.log(orderId, newStatus, branchId);
    const t = (await Order.sequelize?.transaction())!;
    try {
      if (!orderStatusList.includes(newStatus)) {
        throw new BadRequestException('Invalid status');
      }
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new BadRequestException('Order not found');
      }
      if (order.branchId !== branchId) {
        throw new BadRequestException('Order not found');
      }
      const indexNewStatus = orderStatusList.indexOf(newStatus);
      if (orderStatusList[indexNewStatus - 1] !== order.status) {
        throw new BadRequestException('Invalid status');
      }
      await this.orderService.updateOrderById({ status: newStatus }, orderId, t);
      await this.orderStatusService.createOrderStatus(orderId, newStatus, t);
      await t.commit();
      return await this.getById(orderId);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async updateStatusOrderUser(newStatus: string, orderId: number, userId: number) {
    const t = (await Order.sequelize?.transaction())!;
    try {
      if (!orderStatusList.includes(newStatus)) {
        throw new BadRequestException('Invalid status');
      }
      const order = await Order.findOne({
        where: {
          id: orderId,
          userId,
        },
      });

      if (!order) {
        throw new BadRequestException('Order not found');
      }

      const indexNewStatus = orderStatusList.indexOf(newStatus);
      if (orderStatusList[indexNewStatus - 1] !== order.status) {
        throw new BadRequestException('Invalid status');
      }
      await this.orderService.updateOrderById({ status: newStatus }, orderId, t);
      await this.orderStatusService.createOrderStatus(orderId, newStatus, t);
      await t.commit();
      return await this.getById(orderId);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async cancelOrder(orderId: number, branchId: number) {
    const t = (await Order.sequelize?.transaction())!;
    try {
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new BadRequestException('Order not found');
      }
      if (order.branchId !== branchId) {
        throw new BadRequestException('Order not found');
      }
      if (
        [
          orderStatusConstants.payment_failed.code,
          orderStatusConstants.canceled.code,
          orderStatusConstants.shipped.code,
          orderStatusConstants.done.code,
        ].includes(order.status)
      ) {
        throw new BadRequestException('Invalid status');
      }
      await this.orderService.updateOrderById({ status: orderStatusConstants.canceled.code }, orderId, t);
      await this.orderStatusService.createOrderStatus(orderId, orderStatusConstants.canceled.code, t);
      await this.orderStockService.rollbackStockOnFailedPurchase(orderId);
      await t.commit();
      return await this.getById(orderId);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getById(orderId: number) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    return order;
  }

  async getDetailById(invoiceNo: string, branchId: number) {
    try {
      const order = await Order.findOne({
        where: {
          invoiceNo,
          branchId,
        },
        include: [
          {
            model: OrderStatus,
            as: 'orderStatus',
            attributes: ['status', 'createdAt'],
          },
          {
            model: OrderDetail,
            as: 'order_details',
            attributes: ['qty', 'price', 'productId'],
            include: [
              {
                model: Product,
                as: 'products',
                attributes: ['name', 'imageId'],
                include: [
                  {
                    model: Documents,
                    as: 'image',
                    attributes: ['uniqueId'],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!order) {
        throw new BadRequestException('Order not found');
      }
      return order;
    } catch (error) {
      throw error;
    }
  }
}
