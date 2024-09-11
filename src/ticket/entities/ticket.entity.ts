import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique, ManyToOne } from 'typeorm';
import { TicketStatus } from '../ticket-status.enum';
import { User } from 'src/users/entities/user.entity';
import { Payment } from 'src/payment/entities/payment.entity';

@Entity()
@Unique(['name', 'type'])
export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    type: string;

    @Column('decimal')
    price: number;

    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.AVAILABLE,
    })
    status: TicketStatus;

    @ManyToOne(() => Payment, (payment) => payment.tickets)
    payment: Payment;

    @ManyToOne(() => User, (user) => user.tickets)
    user: User;

    @Column({ nullable: true, type: 'timestamp' })
    bookedAt: Date;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
