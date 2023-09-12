import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { TAuthData } from './modules/auth/types/t-auth-data';

@Injectable()
export class AppService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
    async getHello(): Promise<string> {
        const authData: TAuthData = await this.cacheManager.get('authData');
        if (authData?.token_type === 'Bearer') return 'You auth!!!';
        return 'NOT AUTH!';
    }
}
