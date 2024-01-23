import { Module } from '@nestjs/common';
import { ModulesModule } from './modules/modules.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

@Module({
  imports: [ModulesModule, SwaggerModule],
  controllers: [],
  providers: [],
})

export class AppModule {
  static configure(consumer: any): void {
    const config = new DocumentBuilder()
      .setTitle('APICursoOnline')
      .setDescription('API desenvolvida para teste de um curso online.')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(consumer, config);
    SwaggerModule.setup('api', consumer, document);
  }
}

////////