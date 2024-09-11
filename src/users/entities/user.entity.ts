import { Exclude } from 'class-transformer';
import { UserRole } from 'src/constant/enum/role.enum';
import { Payment } from 'src/payment/entities/payment.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    OneToOne,
} from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    @Exclude()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.User,
    })
    role: UserRole;

    @Column({ nullable: true })
    @Exclude()
    refreshToken: string;

    @OneToMany(() => Ticket, (ticket) => ticket.user)
    tickets: Ticket[];

    @OneToOne(() => Payment, (payment) => payment.user)
    payment: Payment;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
