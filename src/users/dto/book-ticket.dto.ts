import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class BookTicketDto {
    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ description: 'List of the ticketids' })
    ticketIds: number[];
}
