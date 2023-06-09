import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { GlobalExceptionFilter } from './filters/GlobalExceptionFilter';
import { EventInterceptor } from './interceptor/event.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get<ConfigService>(ConfigService);
  const host = config.get<string>('PRODUCT_HOST', 'localhost');
  const port = +config.get<number>('PRODUCT_PORT', 3002);
  const portHealth = +config.get<number>('PRODUCT_PORT_HEALTH', 3012);

  const productService =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.TCP,
      options: {
        host: host,
        port: port,
      },
    });

  productService.useGlobalFilters(new GlobalExceptionFilter());
  productService.useGlobalInterceptors(new EventInterceptor());

  productService.listen();

  await app.listen(portHealth, host, () => {
    console.log(`Product Service Listening on http://${host}:${portHealth}`);
  });
}
bootstrap();
