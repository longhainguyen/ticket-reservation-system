import { Ticket } from 'src/ticket/entities/ticket.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    JoinColumn,
    OneToOne,
} from 'typeorm';
import { PaymentStatus } from '../payment.enum';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => Ticket, (ticket) => ticket.payment)
    tickets: Ticket[];

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;

    @Column({ type: 'timestamp', nullable: true })
    paymentAt: Date;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
