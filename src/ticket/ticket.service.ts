import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, QueryFailedError, Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketStatus } from './ticket-status.enum';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TicketService {
    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,
    ) {}

    async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
        const newTicket = this.ticketRepository.create({
            name: createTicketDto.name,
            price: createTicketDto.price,
            type: createTicketDto.type,
        });

        try {
            return await this.ticketRepository.save(newTicket);
        } catch (error) {
            if (error instanceof QueryFailedError && error.message.includes('Duplicate entry')) {
                throw new ConflictException('Duplicate entry for ticket with the same name and type');
            }
            throw error;
        }
    }

    async getTicketsByStatus(status: TicketStatus): Promise<Ticket[]> {
        return this.ticketRepository.find({
            where: { status: status },
        });
    }

    async getAllTickets(): Promise<Ticket[]> {
        return this.ticketRepository.find();
    }

    @Cron('*/1 * * * *')
    async checkPendingTickets() {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        const pendingTickets = await this.ticketRepository.find({
            where: {
                status: TicketStatus.PENDING,
                bookedAt: LessThan(fiveMinutesAgo),
            },
        });

        for (const ticket of pendingTickets) {
            ticket.status = TicketStatus.AVAILABLE;
            ticket.bookedAt = null;
            ticket.user = null;
            ticket.payment = null;
            await this.ticketRepository.save(ticket);
        }
    }
}
