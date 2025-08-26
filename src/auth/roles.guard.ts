import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, IS_PUBLIC_KEY } from './roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable()
export class RolesGuard extends AuthGuard('jwt') implements CanActivate {
    constructor(private reflector: Reflector) { super() }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        const superCan = super.canActivate(context);
        let canActivate: boolean;

        if (superCan instanceof Observable) {
            canActivate = (await firstValueFrom(superCan));
        } else {
            canActivate = (await Promise.resolve(superCan));
        }

        if (!canActivate) return false;

        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        console.log('User from request:', user);
        console.log('Required Roles:', requiredRoles);

        if (!user) {
            throw new UnauthorizedException('User not found in request');
        }

        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException('You do not have the required role');
        }

        if (context.getType() === 'http') {
            const request = context.switchToHttp().getRequest();
            if (request.url.startsWith('/image/')) {
                return true; // bypass guard
            }
        }
        
        return requiredRoles.includes(user.role);
    }
}
