import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class JwtGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = Reflect.getMetadata('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
