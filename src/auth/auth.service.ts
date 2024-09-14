import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

const configService = new ConfigService();

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async signIn(username: string, pass: string): Promise<{ access_token: string; refresh_token: string }> {
        const user = await this.usersService.findOne(username);

        if (!user || !(await bcrypt.compare(pass, user.password))) {
            throw new UnauthorizedException();
        }

        const payload = { sub: user.id, username: user.username, role: user.role };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: configService.getOrThrow('JWT_ACCESS_KEY'),
            expiresIn: '15m',
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: configService.getOrThrow('JWT_REFRESH_KEY'),
            expiresIn: '7d',
        });

        await this.usersService.update(user.id, { refreshToken: refreshToken });

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    async refresh(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: configService.getOrThrow('JWT_REFRESH_KEY'),
            });

            const user = await this.userRepository.findOne({
                where: {
                    id: payload.sub,
                },
            });

            if (!user || user.refreshToken !== refreshToken) {
                throw new UnauthorizedException();
            }

            const newAccessToken = await this.jwtService.signAsync(
                { sub: user.id, username: user.username, role: user.role },
                { secret: configService.getOrThrow('JWT_ACCESS_KEY'), expiresIn: '15m' },
            );

            const newRefreshToken = await this.jwtService.signAsync(
                { sub: user.id, username: user.username, role: user.role },
                { secret: configService.getOrThrow('JWT_REFRESH_KEY'), expiresIn: '7d' },
            );

            await this.usersService.update(user.id, { refreshToken: newRefreshToken });

            return {
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
            };
        } catch (e) {
            throw new UnauthorizedException();
        }
    }
}
