import { forwardRef, Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentModule } from 'src/payment/payment.module';
import { Payment } from 'src/payment/entities/payment.entity';

@Module({
    imports: [forwardRef(() => PaymentModule), TypeOrmModule.forFeature([Ticket, Payment]), ScheduleModule.forRoot()],
    controllers: [TicketController],
    providers: [TicketService],
    exports: [TicketService, TypeOrmModule],
})
export class TicketModule {}
