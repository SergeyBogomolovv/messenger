import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from 'lib/types/jwt-payload'

@Injectable()
export class ProfileGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const request: Request = context.switchToHttp().getRequest()
      const token = request.headers.authorization.split(' ')[1]
      if (!token) throw new UnauthorizedException('У вас нет доступа')
      const user: JwtPayload = this.jwtService.verify(token, {
        secret: this.config.get('auth.secret'),
      })
      if (!user) throw new UnauthorizedException('У вас нет доступа')
      if (request.params.id !== user.id)
        throw new UnauthorizedException('У вас нет доступа')
      return true
    } catch (error) {
      throw new UnauthorizedException('У вас нет доступа')
    }
  }
}
