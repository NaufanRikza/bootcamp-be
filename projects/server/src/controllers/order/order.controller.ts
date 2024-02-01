import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { ProcessError } from '../../helper/Error/errorHandler';
import { OrderService } from '../../service/order/order.service';
import { OrderDashboardService } from '../../service/order/orderDashboard.service';
import OrderDetailsService from '../../service/order/orderDetails.service';
import { OrderStatusService } from '../../service/order/orderStatus.service';
import { IResponse } from '../interface';

export class OrderController {
  orderService: OrderService;
  orderDashboardService: OrderDashboardService;
  orderDetailService: OrderDetailsService;
  orderStatusService: OrderStatusService;
  constructor() {
    this.orderService = new OrderService();
    this.orderDashboardService = new OrderDashboardService();
    this.orderDetailService = new OrderDetailsService();
    this.orderStatusService = new OrderStatusService();
  }

  async create(req: Request, res: Response<IResponse<any>>) {
    try {
      const userId = req.user.userId;
      req.body.userId = userId;
      const result = await this.orderService.createOrder(req.body);

      res.status(HttpStatusCode.Created).json({
        statusCode: HttpStatusCode.Created,
        message: 'Order created',
        data: result,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }
  async getAll(req: Request, res: Response<IResponse<any>>) {
    try {
      const branchId = req.user.branchId;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.pageSize) || 10;
      const result = await this.orderService.pageOrderManagement(page, limit, branchId, req.query);
      res.status(HttpStatusCode.Ok).json({
        statusCode: HttpStatusCode.Ok,
        message: 'Order fetched',
        data: result,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }

  async updateOrderStatus(req: Request, res: Response<IResponse<any>>) {
    try {
      const orderId = Number(req.params.orderId);
      const status = req.body.status;
      const branchId = req.user.branchId;
      const result = await this.orderDashboardService.updateStatusOrder(status, orderId, branchId);
      res.status(HttpStatusCode.Ok).json({
        statusCode: HttpStatusCode.Ok,
        message: 'Order status updated',
        data: result,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }

  async updateOrderStatusUser(req: Request, res: Response<IResponse<any>>) {
    try {
      const orderId = Number(req.params.orderId);
      const status = req.body.status;
      const userId = req.user.userId;
      const result = await this.orderDashboardService.updateStatusOrderUser(status, orderId, userId);
      res.status(HttpStatusCode.Ok).json({
        statusCode: HttpStatusCode.Ok,
        message: 'Order status updated',
        data: result,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }

  async cancelOrder(req: Request, res: Response<IResponse<any>>) {
    try {
      const orderId = Number(req.params.orderId);
      const branchId = req.user.branchId;
      const branchIdQuery = Number(req.query.branchId);
      const role = req.user.role;
      const result = await this.orderDashboardService.cancelOrder(
        orderId,
        role.includes('admin') ? branchId : branchIdQuery,
        role
      );
      res.status(HttpStatusCode.Ok).json({
        statusCode: HttpStatusCode.Ok,
        message: 'Order canceled',
        data: result,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }

  async getOrderDetailDashboard(req: Request, res: Response<IResponse<any>>) {
    try {
      const invoiceNo = req.params.invoiceNo;
      const branchId = req.user.branchId;
      const result = await this.orderDashboardService.getDetailById(invoiceNo, branchId);
      res.status(HttpStatusCode.Ok).json({
        statusCode: HttpStatusCode.Ok,
        message: 'Order fetched',
        data: result,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }

  async getOrderDetailPage(req: Request, res: Response<IResponse<any>>) {
    try {
      const invoiceNo = req.query.invoiceNo;
      const userId = Number(req.user.userId);
      const result = await this.orderDetailService.getOrderDetailsByInvoice(String(invoiceNo), userId);
      res.status(HttpStatusCode.Ok).json({
        statusCode: HttpStatusCode.Ok,
        message: 'Order fetched',
        data: result,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }

  async getNotification(req: Request, res: Response<IResponse<any>>) {
    try {
      const userId = req.user.userId;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.pageSize) || 10;
      const result = await this.orderStatusService.getOrderStatusPage(userId, page, limit);
      res.status(HttpStatusCode.Ok).json({
        statusCode: HttpStatusCode.Ok,
        message: 'Order fetched',
        data: result,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }
}
