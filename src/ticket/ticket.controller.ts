import { Controller, Post, Body } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/constant/enum/role.enum';

@Controller('ticket')
export class TicketController {
    constructor(private readonly ticketService: TicketService) {}

    @Post()
    @Roles(UserRole.Admin)
    create(@Body() createTicketDto: CreateTicketDto) {
        return this.ticketService.create(createTicketDto);
    }
}
