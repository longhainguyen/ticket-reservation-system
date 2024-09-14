import { BadRequestException, ConflictException, Injectable, NotFoundException, Req } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { TicketStatus } from 'src/ticket/ticket-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { In, Repository } from 'typeorm';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { TicketService } from 'src/ticket/ticket.service';
import { currency } from 'src/constant/const/const';
import { PaymentTicket } from './entities/payment-ticket.entity';
import { PaymentTicketStatus } from 'src/constant/enum/payment-ticket.enum';
import { PaymentStatus } from './payment.enum';

const configService = new ConfigService();

@Injectable()
export class PaymentService {
    private stripe: Stripe;

    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,

        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,

        private readonly usersService: UsersService,

        private readonly ticketService: TicketService,

        @InjectRepository(PaymentTicket)
        private readonly paymentTicketRepository: Repository<PaymentTicket>,
    ) {
        this.stripe = new Stripe(configService.getOrThrow('STRIPE_SECRET_KEY'), {
            apiVersion: '2024-06-20',
        });
    }

    async create(createPaymentDto: CreatePaymentDto, @Req() req) {
        console.log(createPaymentDto.paymentId);

        const payment = await this.paymentRepository.findOne({
            where: {
                id: createPaymentDto.paymentId,
            },
            relations: {
                paymentTickets: {
                    ticket: true,
                },
            },
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        if (payment.status === PaymentStatus.FAILED) {
            throw new BadRequestException('Payment has expired or failed');
        }

        const ticketIds = payment.paymentTickets.map((paymentTicket) => paymentTicket.ticket.id);
        const tickets = payment.paymentTickets.map((paymentTicket) => paymentTicket.ticket);

        const lineItems = tickets.map((ticket) => {
            if (ticket.status === TicketStatus.PENDING) {
                return {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: ticket.name,
                        },
                        unit_amount: Math.round(Number(ticket.price) * 100),
                    },
                    quantity: 1,
                };
            } else {
                throw new ConflictException(
                    `Seart ${ticket.seat} of Ticket ${ticket.name} is already booked or not available`,
                );
            }
        });

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            success_url: `http://localhost:3000/payment/success`,
            cancel_url: `http://localhost:3000/payment/cancel`,
            metadata: {
                userId: req.user.sub,
                ticketIds: ticketIds.join(','),
                paymentId: payment.id,
            },
        });

        return session.url;
    }

    async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
        const ticketIds = session.metadata.ticketIds.split(',');
        const paymentId = session.metadata.paymentId;
        console.log(session.metadata);

        // customer_details
        await this.paymentRepository.update(
            { id: +paymentId },
            {
                paymentAt: new Date(),
                stripePaymentIntentId: session.payment_intent as string,
                status: PaymentStatus.SUCCESS,
            },
        );

        await this.ticketRepository.update(
            { id: In(ticketIds) },
            {
                status: TicketStatus.BOOKED,
                bookedAt: new Date(),
            },
        );

        const payment = await this.paymentRepository.findOneBy({ id: +paymentId });

        const tickets = await this.ticketRepository.findBy({ id: In(ticketIds) });

        for (const ticket of tickets) {
            const newPaymentTicket = this.paymentTicketRepository.create({
                payment,
                ticket,
                status: PaymentTicketStatus.PAID,
            });
            await this.paymentTicketRepository.save(newPaymentTicket);
        }
    }

    async handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
        const paymentId = paymentIntent.metadata.paymentId;

        await this.paymentRepository.update(
            { id: +paymentId },
            {
                status: PaymentStatus.FAILED,
            },
        );
    }
}
