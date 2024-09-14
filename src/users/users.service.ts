import { BadRequestException, Injectable, NotFoundException, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Connection, In, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { TicketStatus } from 'src/ticket/ticket-status.enum';
import { plainToClass } from 'class-transformer';
import { Payment } from 'src/payment/entities/payment.entity';
import { PaymentTicket } from 'src/payment/entities/payment-ticket.entity';
import { PaymentStatus } from 'src/payment/payment.enum';
import { PaymentTicketStatus } from 'src/constant/enum/payment-ticket.enum';
import { BookTicketDto } from './dto/book-ticket.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,

        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,

        @InjectRepository(PaymentTicket)
        private readonly paymentTicketRepository: Repository<PaymentTicket>,

        private readonly connection: Connection,
    ) {}

    async findOne(username: string): Promise<User> {
        return await this.userRepository.findOne({ where: { username } });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        const newUser = this.userRepository.create({
            username: createUserDto.username,
            password: hashedPassword,
        });

        return await this.userRepository.save(newUser);
    }

    async update(id: number, updateData: Partial<User>): Promise<void> {
        await this.userRepository.update(id, updateData);
    }

    async findOneById(id: number): Promise<User | undefined> {
        const user = this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new Error('User not found');
        }
        return plainToClass(User, user);
    }

    async bookTicket(bookTicketDto: BookTicketDto, @Req() req): Promise<any> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const user = await this.findOneById(req.user.sub);

            const tickets = await this.ticketRepository.find({
                where: { id: In(bookTicketDto.ticketIds) },
            });

            if (tickets.length === 0) {
                throw new NotFoundException('Tickets not found');
            }

            const unavailableTickets = tickets.filter((ticket) => ticket.status !== TicketStatus.AVAILABLE);
            if (unavailableTickets.length > 0) {
                throw new BadRequestException(
                    `Some tickets are not available for booking: ${unavailableTickets.map((ticket) => ticket.id).join(', ')}`,
                );
            }

            const totalAmount = tickets.reduce((sum, ticket) => {
                return sum + Number(ticket.price);
            }, 0);

            const newPayment = this.paymentRepository.create({
                status: PaymentStatus.PENDING,
                user: user,
                amount: totalAmount,
            });
            const payment = await this.paymentRepository.save(newPayment);

            tickets.forEach((ticket) => {
                ticket.status = TicketStatus.PENDING;
                ticket.bookedAt = new Date();
            });

            const paymentTickets = tickets.map((ticket) =>
                this.paymentTicketRepository.create({
                    payment: payment,
                    ticket: ticket,
                    status: PaymentTicketStatus.PENDING,
                }),
            );

            await Promise.all([this.ticketRepository.save(tickets), this.paymentTicketRepository.save(paymentTickets)]);

            await queryRunner.commitTransaction();

            return {
                payment: {
                    id: payment.id,
                    status: payment.status,
                    createdAt: payment.createdAt,
                },
                tickets: tickets.map((ticket) => ({
                    id: ticket.id,
                    name: ticket.name,
                    price: ticket.price,
                    status: ticket.status,
                    bookedAt: ticket.bookedAt,
                })),
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
