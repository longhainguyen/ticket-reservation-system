import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import rawBodyMiddleware from './middleware/raw-body.middleware';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
        }),
    );
    app.use(rawBodyMiddleware());

    const config = new DocumentBuilder()
        .setTitle('Ticket reservation system')
        .setDescription('The API description')
        .setVersion('1.0')
        .addTag('Ticket reservation')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
            },
            'JWT-auth',
        )
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    app.enableCors();
    await app.listen(3000);
}
bootstrap();
