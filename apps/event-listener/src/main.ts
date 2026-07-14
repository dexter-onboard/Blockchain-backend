import { NestFactory } from '@nestjs/core';
import { ListenerModule } from './listener.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ListenerModule);
  console.log('Event listener running');
  // Keep process alive; listeners attach in onModuleInit
  process.on('SIGINT', async () => {
    await app.close();
    process.exit(0);
  });
}
bootstrap();
