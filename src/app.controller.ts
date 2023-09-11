import { Controller, Get, Inject, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './modules/auth/auth.service';
import { AuthDto } from './modules/auth/auth.dto';
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
    async getKey(@Query() dto: AuthDto): Promise<string> {
        await this.authService.setAuthData(dto);
        return this.appService.getHello();
    }
}
