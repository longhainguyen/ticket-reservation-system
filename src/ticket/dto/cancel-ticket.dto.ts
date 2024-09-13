import { IsNotEmpty, IsNumber } from 'class-validator';

export class CancelTicketDto {
    @IsNumber()
    @IsNotEmpty()
    ticketId: number;
}
