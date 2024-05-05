import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import { Request } from 'express'
import { JwtPayload } from 'lib/types/jwt-payload'

export const User = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest()
    const token = request.headers.authorization.split(' ')[1]
    const user = jwt.decode(token) as JwtPayload
    return user[key]
  },
)
