import { Router } from 'express';
import { OrderController } from '../../controllers/order/order.controller';
import { createOrderValidation } from '../../helper/validator/order/createOrder.validator';
import { updateOrderStatusValidation } from '../../helper/validator/order/updateStatusOrder.validator';
import { permissionsMiddleware } from '../../middleware/permissions.middleware';

export class OrderRouter {
  router: Router;
  orderController: OrderController;

  constructor() {
    this.router = Router({ mergeParams: true });
    this.orderController = new OrderController();
    this.route();
  }

  route() {
    this.router.route('/notifications').get((req, res) => this.orderController.getNotification(req, res));
    this.router.route('/admin').get((req, res) => this.orderController.getAll(req, res));
    this.router.route('/').post(createOrderValidation(), (req, res) => this.orderController.create(req, res));
    this.router
      .route('/status/:orderId')
      .put(updateOrderStatusValidation(), permissionsMiddleware(['can_update_order']), (req, res) =>
        this.orderController.updateOrderStatus(req, res)
      );
    this.router
      .route('/user/status/:orderId')
      .put(updateOrderStatusValidation(), permissionsMiddleware(['can_update_order']), (req, res) =>
        this.orderController.updateOrderStatusUser(req, res)
      );
    this.router
      .route('/cancel/:orderId')
      .put(permissionsMiddleware(['can_update_order']), (req, res) => this.orderController.cancelOrder(req, res));
    this.router
      .route('/dashboard/:invoiceNo')
      .get(permissionsMiddleware(['branch_admin_access', 'can_read_order']), (req, res) =>
        this.orderController.getOrderDetailDashboard(req, res)
      );

    this.router
      .route('/detail')
      .get(permissionsMiddleware(['can_read_order']), (req, res) => this.orderController.getOrderDetailPage(req, res));
  }
}
