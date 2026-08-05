import { Controller, Get, UseGuards } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('credits')
export class CreditsController {
  constructor(private creditsService: CreditsService) {}

  @Get('balance')
  getBalance(@CurrentUser() user: { id: string }) {
    return this.creditsService.getBalance(user.id).then((b) => ({ balance: b }));
  }

  @Get('transactions')
  getTransactions(@CurrentUser() user: { id: string }) {
    return this.creditsService.getTransactions(user.id);
  }
}
