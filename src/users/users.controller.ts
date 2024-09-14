import { Body, Controller, Param, Post, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { Public } from 'src/decorators/public.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @Public()
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        return plainToInstance(User, user);
    }

    @Post(':id/book')
    async bookTicket(@Param('id') ticketId: number, @Request() req): Promise<Ticket> {
        return this.usersService.bookTicket(ticketId, req);
    }
}
