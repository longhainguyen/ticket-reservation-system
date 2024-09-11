import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Payment]), TypeOrmModule.forFeature([Ticket])],
    controllers: [PaymentController],
    providers: [PaymentService],
})
export class PaymentModule {}
