import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketModule } from './ticket/ticket.module';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from 'db/data-source';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
        TypeOrmModule.forRoot(dataSourceOptions),
        TicketModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
