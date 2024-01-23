import { Module } from '@nestjs/common';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.serviceBKP';
import { PrismaService } from 'src/database/PrismaService';

@Module({
  controllers: [ModulesController], 
  providers: [ModulesService, PrismaService], 
})
export class ModulesModule {}


////////