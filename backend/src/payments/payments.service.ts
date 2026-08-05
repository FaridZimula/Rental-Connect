import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { FeaturedService } from '../featured/featured.service';
import { NotificationsService } from '../notifications/notifications.service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Flutterwave = require('flutterwave-node-v3');

const FLW_PUBLIC = process.env.FLUTTERWAVE_PUBLIC_KEY || '';
const FLW_SECRET = process.env.FLUTTERWAVE_SECRET_KEY || '';

@Injectable()
export class PaymentsService {
  private flw: any;

  constructor(
    private prisma: PrismaService,
    private credits: CreditsService,
    private featured: FeaturedService,
    private notifications: NotificationsService,
  ) {
    this.flw = new Flutterwave(FLW_PUBLIC, FLW_SECRET);
  }

  /** Initiate a credit bundle purchase; returns a Flutterwave payment link */
  async initiateCreditPurchase(userId: string, bundleKey: '5' | '10' | '20') {
    const bundles: Record<string, { credits: number; price: number }> = {
      '5': this.parseBundleEnv(process.env.CREDIT_BUNDLE_5 || '5,45000'),
      '10': this.parseBundleEnv(process.env.CREDIT_BUNDLE_10 || '10,80000'),
      '20': this.parseBundleEnv(process.env.CREDIT_BUNDLE_20 || '20,150000'),
    };
    const bundle = bundles[bundleKey];
    if (!bundle) throw new BadRequestException('Invalid bundle key');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const txRef = `RC-CRED-${userId}-${Date.now()}`;

    // Record pending payment
    await this.prisma.payment.create({
      data: {
        user_id: userId,
        type: 'credit_purchase',
        amount: bundle.price,
        currency: 'UGX',
        status: 'pending',
        transaction_ref: txRef,
      },
    });

    const payload = {
      tx_ref: txRef,
      amount: bundle.price,
      currency: 'UGX',
      redirect_url: `${process.env.FLUTTERWAVE_REDIRECT_URL}?type=credit&bundle=${bundleKey}`,
      customer: { email: user!.email, name: user!.full_name },
      meta: { user_id: userId, type: 'credit_purchase', credits: bundle.credits },
      customizations: { title: 'Rental Connect – Connection Credits', logo: '' },
    };

    const response = await this.flw.Payment.initiate(payload);
    return { payment_link: response.data?.link, tx_ref: txRef, bundle };
  }

  /** Initiate a featured-listing purchase */
  async initiateFeaturePurchase(userId: string, propertyId: string, tier: '7day' | '30day') {
    const prices: Record<string, number> = {
      '7day': Number(process.env.FEATURED_7DAY_PRICE) || 25000,
      '30day': Number(process.env.FEATURED_30DAY_PRICE) || 80000,
    };
    const price = prices[tier];
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const txRef = `RC-FEAT-${propertyId}-${Date.now()}`;

    await this.prisma.payment.create({
      data: {
        user_id: userId,
        property_id: propertyId,
        type: 'featured_boost',
        amount: price,
        currency: 'UGX',
        status: 'pending',
        transaction_ref: txRef,
      },
    });

    const payload = {
      tx_ref: txRef,
      amount: price,
      currency: 'UGX',
      redirect_url: `${process.env.FLUTTERWAVE_REDIRECT_URL}?type=feature&tier=${tier}&property=${propertyId}`,
      customer: { email: user!.email, name: user!.full_name },
      meta: { user_id: userId, type: 'featured_boost', property_id: propertyId, tier },
      customizations: { title: 'Rental Connect – Featured Listing', logo: '' },
    };

    const response = await this.flw.Payment.initiate(payload);
    return { payment_link: response.data?.link, tx_ref: txRef, tier, price };
  }

  /** Flutterwave webhook — called by FLW on payment completion */
  async handleWebhook(payload: any, signature: string) {
    // Verify webhook signature
    const expectedHash = process.env.FLUTTERWAVE_SECRET_KEY;
    if (signature !== expectedHash) {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (payload.event !== 'charge.completed' || payload.data?.status !== 'successful') return;

    const txRef = payload.data.tx_ref as string;
    const payment = await this.prisma.payment.findUnique({ where: { transaction_ref: txRef } });
    if (!payment || payment.status === 'successful') return;

    // Mark payment successful
    await this.prisma.payment.update({
      where: { transaction_ref: txRef },
      data: { status: 'successful', gateway_ref: String(payload.data.id) },
    });

    if (payment.type === 'credit_purchase') {
      // Extract bundle info from tx_ref or meta
      const meta = payload.data.meta as any;
      const credits = Number(meta?.credits) || 0;
      await this.credits.addCredits(payment.user_id, credits, txRef);
      await this.notifications.createNotification(payment.user_id, 'payment_successful', {
        content: `${credits} connection credits added to your wallet.`,
        data: { credits, tx_ref: txRef },
      });
    }

    if (payment.type === 'featured_boost' && payment.property_id) {
      const meta = payload.data.meta as any;
      const tier = meta?.tier as '7day' | '30day';
      await this.featured.applyBoost(payment.property_id, tier);
      await this.notifications.createNotification(payment.user_id, 'payment_successful', {
        content: `Your listing has been featured (${tier}).`,
        data: { property_id: payment.property_id, tier },
      });
    }
  }

  private parseBundleEnv(val: string): { credits: number; price: number } {
    const [credits, price] = val.split(',').map(Number);
    return { credits, price };
  }
}
