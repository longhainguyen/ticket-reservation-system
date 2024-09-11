import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [TypeOrmModule.forFeature([Ticket]), ScheduleModule.forRoot()],
    controllers: [TicketController],
    providers: [TicketService],
    exports: [TicketService, TypeOrmModule],
})
export class TicketModule {}
