import {
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, QueryFailedError, Repository, Connection } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketStatus } from './ticket-status.enum';
import { Cron } from '@nestjs/schedule';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { percentRefund, timeCloseBooking } from 'src/constant/const/const';

const configService = new ConfigService();
@Injectable()
export class TicketService {
    private stripe: Stripe;
    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,

        private readonly connection: Connection,
    ) {
        this.stripe = new Stripe(configService.getOrThrow('STRIPE_SECRET_KEY'), {
            apiVersion: '2024-06-20',
        });
    }

    async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
        const newTicket = this.ticketRepository.create({
            name: createTicketDto.name,
            price: createTicketDto.price,
            seat: createTicketDto.seat,
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
        const fiveMinutesAgo = new Date(now.getTime() - timeCloseBooking * 60 * 1000);

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

    async checkAuthorTicket(ticketId: number, userId: number) {
        const ticket = await this.ticketRepository.findOne({
            where: {
                id: ticketId,
            },

            relations: {
                user: true,
            },
        });

        if (ticket.user.id !== userId) {
            throw new ForbiddenException('You are not authorized to cancel this ticket');
        }
    }

    async cancelTicket(ticketId: number, @Req() req) {
        const ticket = await this.ticketRepository.findOne({
            where: {
                id: ticketId,
            },

            relations: {
                payment: true,
                user: true,
            },
        });

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        if (ticket.user.id !== req.user.sub) {
            throw new ForbiddenException('You are not authorized to cancel this ticket');
        }

        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            await this.ticketRepository.update(ticketId, {
                payment: null,
                status: TicketStatus.AVAILABLE,
                bookedAt: null,
            });

            const refund = await this.stripe.refunds.create({
                payment_intent: ticket.payment.stripePaymentIntentId,
                amount: Math.round(ticket.price * 100 * percentRefund), // hoàn lại 90% giá vé
            });

            if (refund.status === 'succeeded') {
                await queryRunner.commitTransaction();
                return { message: 'Ticket canceled and refund processed successfully' };
            } else {
                await queryRunner.rollbackTransaction();
                return { message: 'Refund failed, ticket cancellation aborted' };
            }
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException('Something went wrong during ticket cancellation');
        } finally {
            await queryRunner.release();
        }
    }

    async getTicketsGroupedByName(page: number = 1, limit: number = 10) {
        const offset = (page - 1) * limit;

        const listTicket = await this.ticketRepository
            .createQueryBuilder('ticket')
            .select('ticket.name', 'name')
            .addSelect('ticket.price', 'price')
            .addSelect('COUNT(ticket.id)', 'availableCount')
            .where('ticket.status = :status', { status: TicketStatus.AVAILABLE })
            .groupBy('ticket.name')
            .skip(offset)
            .take(limit)
            .getRawMany();

        const totalGroups = await this.ticketRepository
            .createQueryBuilder('ticket')
            .where('ticket.status = :status', { status: TicketStatus.AVAILABLE })
            .groupBy('ticket.name')
            .getRawMany();

        return {
            data: listTicket,
            total: totalGroups.length,
            page,
            totalPages: Math.ceil(totalGroups.length / limit),
        };
    }
}
