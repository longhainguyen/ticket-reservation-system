import {
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, QueryFailedError, Repository, Connection, In } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketStatus } from './ticket-status.enum';
import { Cron } from '@nestjs/schedule';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { percentRefund, timeCloseBooking } from 'src/constant/const/const';
import { CancelTicketDto } from './dto/cancel-ticket.dto';
import { PaymentTicket } from 'src/payment/entities/payment-ticket.entity';
import { PaymentTicketStatus } from 'src/constant/enum/payment-ticket.enum';
import { Payment } from 'src/payment/entities/payment.entity';
import { PaymentStatus } from 'src/payment/payment.enum';

const configService = new ConfigService();
@Injectable()
export class TicketService {
    private stripe: Stripe;
    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,

        private readonly connection: Connection,

        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,

        @InjectRepository(PaymentTicket)
        private readonly paymentTicketRepository: Repository<PaymentTicket>,
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

        const [pendingTickets, expiredPayments] = await Promise.all([
            this.ticketRepository.find({
                where: {
                    status: TicketStatus.PENDING,
                    bookedAt: LessThan(fiveMinutesAgo),
                },
            }),
            this.paymentRepository.find({
                where: {
                    status: PaymentStatus.PENDING,
                    createdAt: LessThan(fiveMinutesAgo),
                },
            }),
        ]);

        // Cập nhật trạng thái payments
        if (expiredPayments.length > 0) {
            await this.paymentRepository.update(
                { id: In(expiredPayments.map((payment) => payment.id)) },
                { status: PaymentStatus.FAILED },
            );
        }

        // Cập nhật trạng thái tickets
        if (pendingTickets.length > 0) {
            await this.ticketRepository.update(
                { id: In(pendingTickets.map((ticket) => ticket.id)) },
                {
                    status: TicketStatus.AVAILABLE,
                    bookedAt: null,
                },
            );
        }
    }

    async cancelTicket(cancelTicketDto: CancelTicketDto, @Req() req) {
        const paymentTickets = await this.paymentTicketRepository.find({
            where: {
                ticket: {
                    id: In(cancelTicketDto.ticketIds),
                },

                payment: {
                    id: cancelTicketDto.paymentId,
                },
            },
            relations: {
                payment: {
                    user: true,
                },
                ticket: true,
            },
        });

        const payment = await this.paymentRepository.findOne({
            where: {
                id: cancelTicketDto.paymentId,
            },
        });

        if (!payment || payment.status !== PaymentStatus.SUCCESS) {
            throw new NotFoundException('Payment not found or expire or faild');
        }

        if (paymentTickets.length === 0) {
            throw new NotFoundException('Ticket not found');
        }

        // Kiểm tra quyền hủy của user cho tất cả tickets
        const isAuthorized = paymentTickets.every((pt) => pt.payment.user?.id === req.user.sub);
        if (!isAuthorized) {
            throw new ForbiddenException('You are not authorized to cancel these tickets');
        }

        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            // Cập nhật trạng thái của các tickets thành AVAILABLE và gán lại user
            await this.ticketRepository.update(
                { id: In(cancelTicketDto.ticketIds) },
                {
                    status: TicketStatus.AVAILABLE,
                    bookedAt: null,
                },
            );

            // Cập nhật trạng thái của PaymentTicket thành REFUND
            await this.paymentTicketRepository.update(
                { ticket: { id: In(cancelTicketDto.ticketIds) } },
                { status: PaymentTicketStatus.REFUND },
            );

            // Tính tổng số tiền cần hoàn lại
            const totalAmountToRefund = paymentTickets.reduce(
                (total, paymentTicket) => total + Math.round(paymentTicket.ticket.price * 100),
                0,
            );

            // Thực hiện hoàn tiền
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentTickets[0].payment.stripePaymentIntentId,
                amount: totalAmountToRefund * percentRefund,
            });

            // Kiểm tra kết quả hoàn tiền
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
