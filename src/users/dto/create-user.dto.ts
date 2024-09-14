import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Username of the user' })
    username: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Password of the user' })
    password: string;
}
