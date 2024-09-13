import { Controller, Post, Body, Get, Param, Request } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/constant/enum/role.enum';
import { Ticket } from './entities/ticket.entity';
import { TicketStatus } from './ticket-status.enum';

@Controller('ticket')
export class TicketController {
    constructor(private readonly ticketService: TicketService) {}

    @Post()
    @Roles(UserRole.Admin)
    create(@Body() createTicketDto: CreateTicketDto) {
        return this.ticketService.create(createTicketDto);
    }

    @Get('status/:status')
    async getTicketsByStatus(@Param('status') status: TicketStatus): Promise<Ticket[]> {
        return this.ticketService.getTicketsByStatus(status);
    }

    @Get()
    async getAllTickets(): Promise<Ticket[]> {
        return this.ticketService.getAllTickets();
    }

    @Post('cancel-ticket/:ticketId')
    async cancelTicket(@Param('ticketId') ticketId: number, @Request() req) {
        return await this.ticketService.cancelTicket(ticketId, req);
    }
}
