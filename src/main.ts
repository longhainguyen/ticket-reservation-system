import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import rawBodyMiddleware from './middleware/raw-body.middleware';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(rawBodyMiddleware());
    await app.listen(3000);
}
bootstrap();
