import { Controller, Post, Body, Get, Param, Request, Query } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/constant/enum/role.enum';
import { Ticket } from './entities/ticket.entity';
import { TicketStatus } from './ticket-status.enum';
import { Public } from 'src/decorators/public.decorator';
import { CancelTicketDto } from './dto/cancel-ticket.dto';

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

    @Post('cancel-ticket')
    async cancelTicket(@Body() ticketIds: CancelTicketDto, @Request() req) {
        return await this.ticketService.cancelTicket(ticketIds, req);
    }

    @Get('available')
    @Public()
    async getAvailableTicketsGroupedByName(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        const tickets = await this.ticketService.getTicketsGroupedByName(page, limit);
        return {
            data: tickets.data,
            total: tickets.total,
            page: tickets.page,
            totalPages: tickets.totalPages,
            message: 'List of available tickets and remaining number',
        };
    }
}
