import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SignInDto {
    @IsNotEmpty({ message: 'The userName is required' })
    @Length(3, 255)
    @IsString()
    @ApiProperty({ description: 'Username of the user' })
    username: string;

    @IsNotEmpty({ message: 'The password is required' })
    @IsString()
    @ApiProperty({ description: 'Password of the user' })
    password: string;
}
