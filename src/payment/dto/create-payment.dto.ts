import { IsArray } from 'class-validator';

export class CreatePaymentDto {
    @IsArray()
    ticketIds: number[];
}
