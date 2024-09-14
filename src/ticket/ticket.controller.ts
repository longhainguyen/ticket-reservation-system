import { Controller, Post, Body, Get, Param, Request, Query } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/constant/enum/role.enum';
import { Ticket } from './entities/ticket.entity';
import { TicketStatus } from './ticket-status.enum';
import { Public } from 'src/decorators/public.decorator';
import { CancelTicketDto } from './dto/cancel-ticket.dto';
import { ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('tickets')
@Controller('ticket')
export class TicketController {
    constructor(private readonly ticketService: TicketService) {}

    @Post()
    @Roles(UserRole.Admin)
    @ApiOperation({ summary: 'Create a new ticket' })
    @ApiConsumes('application/x-www-form-urlencoded')
    create(@Body() createTicketDto: CreateTicketDto) {
        return this.ticketService.create(createTicketDto);
    }

    @Get('status/:status')
    @ApiOperation({
        summary: 'Get tickets rely on status',
    })
    @ApiParam({
        name: 'status',
        enum: TicketStatus,
        description: 'Status of the tickets',
    })
    async getTicketsByStatus(@Param('status') status: TicketStatus): Promise<Ticket[]> {
        return this.ticketService.getTicketsByStatus(status);
    }

    @Get()
    @ApiOperation({
        summary: 'All of tickets',
    })
    @ApiConsumes('application/x-www-form-urlencoded')
    async getAllTickets(): Promise<Ticket[]> {
        return this.ticketService.getAllTickets();
    }

    @Post('cancel-ticket')
    @ApiOperation({
        summary: 'Cancel tickets',
    })
    async cancelTicket(@Body() ticketIds: CancelTicketDto, @Request() req) {
        return await this.ticketService.cancelTicket(ticketIds, req);
    }

    @Get('available')
    @ApiOperation({
        summary: 'Display a list of all available tickets, including their name, price and remaining number',
    })
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
