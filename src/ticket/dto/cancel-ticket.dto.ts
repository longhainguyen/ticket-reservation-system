import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CancelTicketDto {
    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ description: 'List of the id cancel tickets' })
    ticketIds: number[];

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ description: 'pyment id' })
    paymentId: number;
}
