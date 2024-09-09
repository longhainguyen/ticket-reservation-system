import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TicketStatus } from '../ticket-status.enum';

@Entity()
export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('decimal')
    price: number;

    @Column()
    quantity: number;

    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.AVAILABLE,
    })
    status: TicketStatus;

    @Column({ nullable: true })
    bookedBy: string;

    @Column({ nullable: true, type: 'timestamp' })
    bookedAt: Date;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
