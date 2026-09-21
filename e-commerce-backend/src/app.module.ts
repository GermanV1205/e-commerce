import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { ProductVariantsModule } from './product-variants/product-variants.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { FilesModule } from './files/files.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    // Esto carga tu .env globalmente en toda la aplicación
    ConfigModule.forRoot({ isGlobal: true }), 
    PrismaModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    ProductVariantsModule,
    CartModule,
    OrdersModule,
    FilesModule,
    ReportsModule,
  ],
})
export class AppModule {}