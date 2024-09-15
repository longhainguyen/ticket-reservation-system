import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { PaymentTicket } from 'src/payment/entities/payment-ticket.entity';
import { BullModule } from '@nestjs/bull';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'book-ticket-queue',
        }),
        TypeOrmModule.forFeature([User, Payment, PaymentTicket, Ticket]),
    ],
    providers: [
        UsersService,
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
    exports: [UsersService, TypeOrmModule],
    controllers: [UsersController],
})
export class UsersModule {}
