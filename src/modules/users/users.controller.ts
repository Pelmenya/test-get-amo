import { Controller, Get, Query } from '@nestjs/common';
import { TUserDto } from './types/t-user-dto';

@Controller('users')
export class UsersController {
    @Get('contacts')
    async getContacts(@Query() dto: TUserDto): Promise<TUserDto> {
        return Promise.resolve(dto);
    }
}
