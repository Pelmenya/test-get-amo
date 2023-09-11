import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { AuthDto } from './auth.dto';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly httpService: HttpService,
    ) {}

    async setAuthData(dto: AuthDto) {
        console.log(dto);
        const body = {
            client_id: dto.client_id,
            client_secret: process.env.SECRET_KEY,
            grant_type: 'authorization_code',
            code: dto.code,
            redirect_uri: process.env.REDIRECT_URI,
        };
        const { data } = await firstValueFrom(
            this.httpService
                .post(`https:\/\/${dto.referer}/oauth2/access_token`, body)
                .pipe(
                    catchError((e: any) => {
                        console.log(e);
                        throw 'An error happened!';
                    }),
                ),
        );
        await this.cacheManager.set('host', `https:\/\/${dto.referer}`, 0);
        await this.cacheManager.set('client_id', dto.client_id, 0);
        await this.cacheManager.set('authData', data);
        console.log(data);
    }
}
