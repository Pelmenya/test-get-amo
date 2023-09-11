import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './modules/auth/auth.service';
import { TAuthDto } from './modules/auth/types/t-auth-dto';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly authService: AuthService,
    ) {}

    @Get()
    async setAuth(@Query() dto: TAuthDto): Promise<string> {
        if (Object.entries(dto).length) {
            await this.authService.setAuthData(dto);
        }
        return await this.appService.getHello();
    }
}
