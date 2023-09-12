import { Inject, Injectable } from '@nestjs/common';
import { UserDto } from './types/user-dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { Cache } from 'cache-manager';
import { AuthService } from '../auth/auth.service';
import { TAuthData } from '../auth/types/t-auth-data';

@Injectable()
export class UsersService {
    body: any;
    host: string;
    authData: TAuthData;
    config: any;

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly httpService: HttpService,
        private readonly authService: AuthService,
    ) {}

    async init(dto: UserDto) {
        this.authService.validateExpiresIn();

        const authData: TAuthData = await this.cacheManager.get('authData');
        this.body = [
            {
                name: dto.name,
                custom_fields_values: [
                    { field_code: 'PHONE', values: [{ value: dto.phone }] },
                    { field_code: 'EMAIL', values: [{ value: dto.email }] },
                ],
            },
        ];

        this.host = await this.cacheManager.get('host');

        this.config = {
            headers: {
                Authorization: `${authData.token_type} ${authData.access_token}`,
            },
        };
    }

    async startUseAPIAmoCRM(dto: UserDto) {
        await this.init(dto);

        const user = await this.findUser(dto);

        if (Object.entries(user).length) {
            const dataUpdateUser = await this.updateUser(user);

            return await this.createLead(dataUpdateUser.id);
        } else {
            const dataCreateUser = await this.createUser();
            return await this.createLead(
                dataCreateUser._embedded.contacts[0]['id'],
            );
        }
    }

    async findUser(dto: UserDto) {
        const { data } = await firstValueFrom(
            this.httpService
                .get(
                    `${this.host}/api/v4/contacts?query=${dto.email}`,
                    this.config,
                )
                .pipe(
                    catchError((e: AxiosError) => {
                        console.log(e);
                        throw 'An error happened!';
                    }),
                ),
        );

        return data;
    }

    async updateUser(user: any) {
        const { data } = await firstValueFrom(
            this.httpService
                .patch(
                    `${this.host}/api/v4/contacts/${user._embedded.contacts[0]['id']}`,
                    this.body[0],
                    this.config,
                )
                .pipe(
                    catchError((e: AxiosError) => {
                        console.log(e);
                        throw 'An error happened!';
                    }),
                ),
        );

        return data;
    }

    async createUser() {
        const { data } = await firstValueFrom(
            this.httpService
                .post(`${this.host}/api/v4/contacts`, this.body, this.config)
                .pipe(
                    catchError((e: AxiosError) => {
                        console.log(e);
                        throw 'An error happened!';
                    }),
                ),
        );
        return data;
    }

    async createLead(id: string) {
        const body = [
            {
                name: `Сделка для примера ${new Date().getTime()}`,
                price: Number(new Date().getTime()),
                _embedded: {
                    contacts: [
                        {
                            id,
                        },
                    ],
                },
            },
        ];

        const { data } = await firstValueFrom(
            this.httpService
                .post(`${this.host}/api/v4/leads`, body, this.config)
                .pipe(
                    catchError((e: AxiosError) => {
                        console.log(e);
                        throw 'An error happened!';
                    }),
                ),
        );
        return data;
    }
}
