import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): any {
    const request = context.switchToHttp().getRequest();
    const isGetRequest = request.method === 'GET';
    const excludePaths = ['/api/v1/auth', '/api/v1/cart', '/api/v1/orders', '/api/v1/users/profile', '/api/v1/wishlist'];

    // Only cache GET requests
    if (!isGetRequest) {
      return undefined;
    }

    // Skip caching for specific paths
    if (excludePaths.some(path => request.url.startsWith(path))) {
      return undefined;
    }

    // Skip caching if Authorization header exists (authenticated user)
    if (request.headers.authorization) {
      return undefined;
    }

    return super.trackBy(context);
  }
}
