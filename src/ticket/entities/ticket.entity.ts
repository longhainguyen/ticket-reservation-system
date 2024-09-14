import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { TicketStatus } from '../ticket-status.enum';
import { User } from 'src/users/entities/user.entity';
import { PaymentTicket } from 'src/payment/entities/payment-ticket.entity';

@Entity()
@Unique(['name', 'seat'])
export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    seat: string;

    @Column('decimal')
    price: number;

    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.AVAILABLE,
    })
    status: TicketStatus;

    @OneToMany(() => PaymentTicket, (paymentTicket) => paymentTicket.ticket)
    paymentTickets: PaymentTicket[];

    @ManyToOne(() => User, (user) => user.tickets)
    user: User;

    @Column({ nullable: true, type: 'timestamp' })
    bookedAt: Date;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
