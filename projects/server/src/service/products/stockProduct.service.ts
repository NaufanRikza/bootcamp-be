import Product from '../../database/models/products.model';
import { BadRequestException } from '../../helper/Error/BadRequestException/BadRequestException';

export class StockProductService {
  async checkStockProduct(productId: number, branchId: number, qty: number, price: number): Promise<boolean> {
    const product = await Product.findOne({
      where: {
        id: productId,
        branchId,
      },
    });
    if (!product) {
      throw new BadRequestException('Product out of stock', { error: 'product_out_of_stock' });
    }
    if (product.price !== price) {
      throw new BadRequestException('Product price not match', { error: 'product_price_not_match' });
    }
    if (product.stock < qty) {
      throw new BadRequestException('Product out of stock', { error: 'product_out_of_stock' });
    }
    return true;
  }
}
