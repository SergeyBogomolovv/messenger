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

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest()
    const token = request.headers.authorization.split(' ')[1]
    if (!token) throw new UnauthorizedException()
    try {
      const user = this.jwtService.verify(token, {
        secret: this.config.get('auth.secret'),
      })
      if (!user) throw new UnauthorizedException()
      return true
    } catch (error) {
      throw new UnauthorizedException()
    }
  }
}
