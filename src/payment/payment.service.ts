import { Injectable, Req } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { TicketStatus } from 'src/ticket/ticket-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { In, Repository } from 'typeorm';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
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
    ) {
        this.stripe = new Stripe(configService.getOrThrow('STRIPE_SECRET_KEY'), {
            apiVersion: '2024-06-20',
        });
    }

    async create(createPaymentDto: CreatePaymentDto, @Req() req) {
        const tickets = await this.ticketRepository.findBy({ id: In(createPaymentDto.ticketIds) });

        if (tickets.length === 0) {
            throw new Error('No tickets found with the given IDs');
        }

        const newPayment = this.paymentRepository.create({
            tickets: tickets,
            status: PaymentStatus.PENDING,
        });

        const lineItems = tickets.map((ticket) => {
            if (ticket.status !== TicketStatus.PENDING) {
                throw new Error(`Ticket ${ticket.name} is already booked`);
            }

            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: ticket.name,
                    },
                    unit_amount: Math.round(Number(ticket.price) * 100),
                },
                quantity: 1,
            };
        });

        const payment = await this.paymentRepository.save(newPayment);

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            success_url: `http://localhost:3000/payment/success`,
            cancel_url: `http://localhost:3000/payment/cancel`,
            metadata: {
                paymentId: payment.id,
                userId: req.user.sub,
                ticketIds: createPaymentDto.ticketIds.join(','),
            },
        });

        return session.url;
    }

    async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
        const ticketIds = session.metadata.ticketIds.split(',');
        const paymentId = session.metadata.paymentId;

        await this.paymentRepository.update(
            { id: +paymentId },
            {
                status: PaymentStatus.PAID,
                paymentAt: new Date(),
            },
        );

        await this.ticketRepository.update(
            { id: In(ticketIds) },
            {
                status: TicketStatus.BOOKED,
                bookedAt: new Date(),
            },
        );
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
