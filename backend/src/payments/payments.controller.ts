import { Controller, Post, Body, Headers, UseGuards, Param, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  /** Buyer: purchase a credit bundle */
  @UseGuards(JwtAuthGuard)
  @Post('credits/initiate')
  initiateCreditPurchase(
    @CurrentUser() user: { id: string },
    @Body('bundle') bundle: '5' | '10' | '20',
  ) {
    return this.paymentsService.initiateCreditPurchase(user.id, bundle);
  }

  /** Owner: pay for a featured listing boost */
  @UseGuards(JwtAuthGuard)
  @Post('feature/initiate')
  initiateFeature(
    @CurrentUser() user: { id: string },
    @Body('property_id') propertyId: string,
    @Body('tier') tier: '7day' | '30day',
  ) {
    return this.paymentsService.initiateFeaturePurchase(user.id, propertyId, tier);
  }

  /** Flutterwave webhook (no auth — called by payment gateway) */
  @Post('webhook')
  webhook(
    @Body() payload: any,
    @Headers('verif-hash') signature: string,
  ) {
    return this.paymentsService.handleWebhook(payload, signature);
  }
}
