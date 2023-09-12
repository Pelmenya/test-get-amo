import { Controller, Get, Query } from '@nestjs/common';
import { UserDto } from './types/user-dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('contacts')
    async getContacts(@Query() dto: UserDto) {
        return await this.usersService.startUseAPIAmoCRM(dto);
    }
}
