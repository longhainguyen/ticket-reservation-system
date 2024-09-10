import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findOne(username: string): Promise<User> {
        return await this.userRepository.findOne({ where: { username } });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        const newUser = this.userRepository.create({
            username: createUserDto.username,
            password: hashedPassword,
        });

        return await this.userRepository.save(newUser);
    }

    async update(id: number, updateData: Partial<User>): Promise<void> {
        await this.userRepository.update(id, updateData);
    }

    async findOneById(id: number): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { id } });
    }
}
