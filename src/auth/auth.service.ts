import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }
    
    async validateUser(username: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { username } });
        if (!user) throw new UnauthorizedException('User not found');

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

        // Jangan kembalikan password ke client
        const { password: _, ...result } = user;
        return result;
    }

    login(user: { idUser: number; username: string; role: string }) {
        const payload = { sub: user.idUser, username: user.username, role: user.role };
        console.log(`User logged in: ${user.username}, Role: ${user.role}`);
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    }
