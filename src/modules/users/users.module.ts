import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [HttpModule, AuthModule],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}
