import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { ProcessError } from '../../helper/Error/errorHandler';
import { OrderService } from '../../service/order/order.service';
import { IResponse } from '../interface';
import { OrderDashboardService } from '../../service/order/orderDashboard.service';

export class OrderController {
  orderService: OrderService;
  orderDashboardService: OrderDashboardService;
  constructor() {
    this.orderService = new OrderService();
    this.orderDashboardService = new OrderDashboardService();
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

  async cancelOrder(req: Request, res: Response<IResponse<any>>) {
    try {
      const orderId = Number(req.params.orderId);
      const branchId = req.user.branchId;
      const result = await this.orderDashboardService.cancelOrder(orderId, branchId);
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
      console.log(req.params);
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
}