import { NestFactory } from '@nestjs/core';
import { IndexerModule } from './indexer.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(IndexerModule);
  console.log('Indexer running');
  process.on('SIGINT', async () => {
    await app.close();
    process.exit(0);
  });
}
bootstrap();
