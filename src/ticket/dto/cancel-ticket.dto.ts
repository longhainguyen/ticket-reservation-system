import { IsArray, IsNotEmpty } from 'class-validator';

export class CancelTicketDto {
    @IsArray()
    @IsNotEmpty()
    ticketIds: number[];
}
