import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { PaymentTicketStatus } from 'src/constant/enum/payment-ticket.enum';

@Entity()
export class PaymentTicket {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Payment, (payment) => payment.paymentTickets)
    @JoinColumn()
    payment: Payment;

    @ManyToOne(() => Ticket, (ticket) => ticket.paymentTickets)
    @JoinColumn()
    ticket: Ticket;

    @Column({
        type: 'enum',
        enum: PaymentTicketStatus,
    })
    status: PaymentTicketStatus;
}
