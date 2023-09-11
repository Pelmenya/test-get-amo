import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { TAuthDto } from './types/t-auth-dto';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { TAuthData } from './types/t-auth-data';

@Injectable()
export class AuthService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly httpService: HttpService,
    ) {}

    async setAuthData(dto: TAuthDto) {
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
                    catchError((e: AxiosError) => {
                        console.log(e);
                        throw 'An error happened!';
                    }),
                ),
        );
        await this.cacheManager.set('host', `https:\/\/${dto.referer}`, 0);
        await this.cacheManager.set('client_id', dto.client_id, 0);
        await this.cacheManager.set(
            'authData',
            {
                ...data,
                expire_in: data.expire_in * 1000, //миллисекунд
                time: new Date().getTime(),
            },
            0,
        );
    }

    async validateExpiresIn() {
        const authData: TAuthData = await this.cacheManager.get('authData');
        if (new Date().getTime() >= authData.time + authData.expire_in) {
            const client_id = await this.cacheManager.get('client_id');
            const host = await this.cacheManager.get('host');

            const body = {
                client_id,
                client_secret: process.env.SECRET_KEY,
                grant_type: 'refresh_token',
                refresh_token: authData.refresh_token,
                redirect_uri: process.env.REDIRECT_URI,
            };
            const { data } = await firstValueFrom(
                this.httpService.post(`${host}/oauth2/access_token`, body).pipe(
                    catchError((e: AxiosError) => {
                        console.log(e);
                        throw 'An error happened!';
                    }),
                ),
            );
            await this.cacheManager.set(
                'authData',
                {
                    ...data,
                    expire_in: data.expire_in * 1000, //миллисекунд
                    time: new Date().getTime(),
                },
                0,
            );
        }
    }
}
