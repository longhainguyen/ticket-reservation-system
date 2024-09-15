import { Body, Controller, Post, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { Public } from 'src/decorators/public.decorator';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookTicketDto } from './dto/book-ticket.dto';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('JWT-auth')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @Public()
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        return plainToInstance(User, user);
    }

    @Post('/book')
    @ApiOperation({ summary: 'Book a ticket' })
    async bookTicket(@Body() bookTicketDto: BookTicketDto, @Request() req): Promise<any> {
        const bookDetail = await this.usersService.bookTicket(bookTicketDto, req);
        return {
            bookDetail: bookDetail,
            message: 'Your booking request has been placed in the queue',
        };
    }
}
