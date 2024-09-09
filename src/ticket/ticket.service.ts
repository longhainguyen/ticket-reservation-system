import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketService {
    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,
    ) {}

    async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
        const { name, price, quantity } = createTicketDto;

        const newTicket = this.ticketRepository.create({
            name: name,
            quantity: quantity,
            price: price,
        });

        return await this.ticketRepository.save(newTicket);
    }
}
