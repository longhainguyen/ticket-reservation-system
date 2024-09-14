import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { PaymentTicket } from './payment-ticket.entity';
import { PaymentStatus } from '../payment.enum';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => PaymentTicket, (paymentTicket) => paymentTicket.payment)
    paymentTickets: PaymentTicket[];

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;

    @Column({ type: 'timestamp', nullable: true })
    paymentAt: Date;

    @Column({ nullable: true })
    stripePaymentIntentId: string;

    @ManyToOne(() => User)
    @JoinColumn()
    user: User;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
