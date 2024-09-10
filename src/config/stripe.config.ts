import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

const configService = new ConfigService();

const stripe = new Stripe(configService.getOrThrow('STRIPE_SECRET_KEY'), {
    apiVersion: '2024-06-20',
});

export default stripe;
