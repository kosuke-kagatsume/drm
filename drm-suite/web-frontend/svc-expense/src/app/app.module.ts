import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExpenseModule } from './expense/expense.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ExpenseModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
