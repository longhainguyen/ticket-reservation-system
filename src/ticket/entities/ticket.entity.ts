import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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

    @Column({ default: 'available' })
    status: string;

    @Column({ nullable: true })
    bookedBy: string;

    @Column({ nullable: true, type: 'timestamp' })
    bookedAt: Date;

    @Column({ nullable: true, type: 'timestamp' })
    confirmedAt: Date;
}
