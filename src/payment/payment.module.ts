import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { UsersModule } from 'src/users/users.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/users/roles.guard';
import { PaymentTicket } from './entities/payment-ticket.entity';

@Module({
    imports: [forwardRef(() => TicketModule), UsersModule, TypeOrmModule.forFeature([Ticket, Payment, PaymentTicket])],
    controllers: [PaymentController],
    providers: [
        PaymentService,
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
    exports: [PaymentService, TypeOrmModule],
})
export class PaymentModule {}
