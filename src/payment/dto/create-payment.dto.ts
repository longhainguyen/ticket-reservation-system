import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class CreatePaymentDto {
    @IsArray()
    @ApiProperty({ description: 'List of the tickets id' })
    ticketIds: number[];
}
