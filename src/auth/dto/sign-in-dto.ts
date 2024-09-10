import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SignInDto {
    @IsNotEmpty({ message: 'The userName is required' })
    @Length(3, 255)
    @IsString()
    username: string;

    @IsNotEmpty({ message: 'The password is required' })
    @IsString()
    password: string;
}
