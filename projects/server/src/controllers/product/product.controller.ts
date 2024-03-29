import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
import { messages } from '../../config/message';
import { sortOptions } from '../../database/models/base.model';
import Product from '../../database/models/products.model';
import { ProcessError } from '../../helper/Error/errorHandler';
import ProductService from '../../service/products/product.service';
import { IResponse } from '../interface';
import { OrderProductService } from '../../service/products/orderProduct.service';


export default class ProductController {
  productService: ProductService;
  orderProductService: OrderProductService;

  constructor() {
    this.productService = new ProductService();
    this.orderProductService = new OrderProductService();
  }

  async createProduct(req: Request, res: Response<IResponse<Product>>) {
    try {
      const file = req.file as Express.Multer.File;
      const product = await this.productService.createProduct(file, { ...req.body, branchId: req.user.branchId });
      res.status(HttpStatusCode.Created).json({
        statusCode: HttpStatusCode.Created,
        message: messages.CREATED,
        data: product,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }

  async getAllProductByBranch(req: Request, res: Response<IResponse<Product[]>>, next: NextFunction) {
    if (req.query.page) return next();
    try {
      const products = await this.productService.getByBranchNoFilter(req.user.branchId);
      res.status(HttpStatusCode.Ok).json({
        statusCode: HttpStatusCode.Ok,
        message: 'Get product by branch success',
        data: products,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }
  async page(req: Request, res: Response<IResponse<any>>) {
    try {
      const { page, limit } = req.query;
      const sortOption: sortOptions = {
        key: req.query.sortBy as string,
        order: req.query.order as string,
      };

      const products = await this.productService.page(
        Number(page),
        Number(limit),
        req.user.branchId,
        req.query,
        sortOption
      );
      res.status(HttpStatusCode.Ok).json({
        statusCode: HttpStatusCode.Ok,
        message: messages.SUCCESS,
        data: products,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }

  async updateProduct(req: Request, res: Response<IResponse<any>>) {
    try {
      const { id } = req.params;
      const product = await this.productService.updateById(Number(id), req.user.branchId, req.body, req.user.userId);
      res.status(HttpStatusCode.Ok).json({
        statusCode: HttpStatusCode.Ok,
        message: messages.SUCCESS,
        data: product,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }
  async deleteProduct(req: Request, res: Response<IResponse<any>>) {
    try {
      const { id } = req.params;
      const product = await this.productService.deleteById(Number(id), req.user.branchId);
      res.status(HttpStatusCode.NoContent).json({
        statusCode: HttpStatusCode.NoContent,
        message: messages.SUCCESS,
        data: product,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }

  async getProductById(req: Request, res: Response<IResponse<any>>) {
    try {
      const { id } = req.params;
      const product = await this.productService.getById(Number(id), req.user.branchId);
      res.status(HttpStatusCode.Ok).json({
        statusCode: HttpStatusCode.Ok,
        message: messages.SUCCESS,
        data: product,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }

  async updateWithImageById(req: Request, res: Response<IResponse<any>>) {
    try {
      const { id } = req.params;
      const file = req.file as Express.Multer.File;
      const product = await this.productService.updateWithImage(
        file,
        Number(id),
        req.user.branchId,
        req.body,
        req.user.userId
      );
      res.status(HttpStatusCode.Ok).json({
        statusCode: HttpStatusCode.Ok,
        message: messages.SUCCESS,
        data: product,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }

  async findDuplicateProduct(req: Request, res: Response<IResponse<any>>) {
    try {
      const { name } = req.query;
      const product = await this.productService.findDuplicateProduct(req.user.branchId, name as string);
      res.status(HttpStatusCode.Ok).json({
        statusCode: HttpStatusCode.Ok,
        message: messages.SUCCESS,
        data: product,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }

  async getProductMultiple(req: Request, res: Response<IResponse<Product[]>>) {
    // productid is ?productid=1,2,3,4,5
    try {
      const { productId } = req.query;

      const products = await this.orderProductService.getMultipleProduct(productId as string);
      res.status(HttpStatusCode.Ok).json({
        statusCode: HttpStatusCode.Ok,
        message: messages.SUCCESS,
        data: products,
      });
    } catch (error) {
      ProcessError(error, res);
    }
  }
}
