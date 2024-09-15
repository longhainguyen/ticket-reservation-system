import { Processor, Process } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { Job } from 'bull';

@Injectable()
@Processor('book-ticket-queue')
export class TicketProcessor {
    constructor(private readonly userService: UsersService) {}

    @Process('book-ticket')
    async handleBookTicket(job: Job) {
        const { bookTicketDto, req } = job.data;
        return this.userService.bookTicket(bookTicketDto, req);
    }
}
