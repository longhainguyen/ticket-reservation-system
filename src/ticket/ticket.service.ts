import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketStatus } from './ticket-status.enum';

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
}
