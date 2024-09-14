import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateTicketDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Name of ticket' })
    name: string;

    @IsNumber()
    @Min(0)
    @ApiProperty({ description: 'Price of the  ticket' })
    price: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Seat or location of the ticket' })
    seat: string;
}
