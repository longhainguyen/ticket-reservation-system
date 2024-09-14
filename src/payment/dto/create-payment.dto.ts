import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreatePaymentDto {
    @IsNumber()
    @ApiProperty({ description: 'Payment id' })
    paymentId: number;
}
