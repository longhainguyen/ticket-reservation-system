import { Body, Controller, Post, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { Public } from 'src/decorators/public.decorator';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookTicketDto } from './dto/book-ticket.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiConsumes('application/x-www-form-urlencoded')
    @Public()
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        return plainToInstance(User, user);
    }

    @Post('/book')
    @ApiOperation({ summary: 'Book a ticket' })
    @ApiConsumes('application/x-www-form-urlencoded')
    async bookTicket(@Body() bookTicketDto: BookTicketDto, @Request() req): Promise<Ticket> {
        return this.usersService.bookTicket(bookTicketDto, req);
    }
}
