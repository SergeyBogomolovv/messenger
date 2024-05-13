import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { TokensService } from 'src/repositories/tokens/tokens.service'

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly tokenService: TokensService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest()
    const token = request.headers.authorization.split(' ')[1]
    if (!token) throw new UnauthorizedException()
    try {
      const user = this.tokenService.validateAccessToken(token)
      if (!user) throw new UnauthorizedException()
      return true
    } catch (error) {
      throw new UnauthorizedException()
    }
  }
}
