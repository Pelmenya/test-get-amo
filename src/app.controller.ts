import { Controller, Get, Inject, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './modules/auth/auth.service';
import { TAuthDto } from './modules/auth/t-auth-dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly authService: AuthService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    @Get()
    async getKey(@Query() dto: TAuthDto): Promise<string> {
        await this.authService.setAuthData(dto);
        return this.appService.getHello();
    }
}
