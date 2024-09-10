import { BadRequestException, Injectable, NotFoundException, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { TicketStatus } from 'src/ticket/ticket-status.enum';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,
    ) {}

    async findOne(username: string): Promise<User> {
        return await this.userRepository.findOne({ where: { username } });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        const newUser = this.userRepository.create({
            username: createUserDto.username,
            password: hashedPassword,
        });

        return await this.userRepository.save(newUser);
    }

    async update(id: number, updateData: Partial<User>): Promise<void> {
        await this.userRepository.update(id, updateData);
    }

    async findOneById(id: number): Promise<User | undefined> {
        const user = this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new Error('User not found');
        }
        return plainToClass(User, user);
    }

    async bookTicket(ticketId: number, @Req() req): Promise<Ticket> {
        const user = await this.findOneById(req.user.sub);

        const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });

        if (!ticket) {
            throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
        }

        if (ticket.status !== TicketStatus.AVAILABLE) {
            throw new BadRequestException(`Ticket with ID ${ticketId} is not available for booking`);
        }

        ticket.user = user;
        ticket.status = TicketStatus.PENDING;
        ticket.bookedAt = new Date();

        return await this.ticketRepository.save(ticket);
    }
}
