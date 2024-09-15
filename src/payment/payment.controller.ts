import { Controller, Post, Body, Request, Get, Req, Res, Headers, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Public } from 'src/decorators/public.decorator';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import RequestWithRawBody from 'src/middleware/requestWithRawBody.interface';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

const configService = new ConfigService();

@ApiTags('payments')
@Controller('payment')
@ApiBearerAuth('JWT-auth')
export class PaymentController {
    private stripe: Stripe;
    constructor(private readonly paymentService: PaymentService) {
        this.stripe = new Stripe(configService.getOrThrow('STRIPE_SECRET_KEY'), {
            apiVersion: '2024-06-20',
        });
    }

    @Post()
    @ApiOperation({ summary: 'Create a new payment - confirm booking ticket' })
    async create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
        const sessionUrl = await this.paymentService.create(createPaymentDto, req);
        return { url: sessionUrl };
    }

    @Get('success')
    @Public()
    handlePaymentSuccess() {
        return `Payment successful for session`;
    }

    @Get('cancel')
    @Public()
    handlePaymentCancel() {
        return 'Payment was canceled';
    }

    @Post('webhook')
    @Public()
    async handleWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() request: RequestWithRawBody,
        @Res() res: Response,
    ) {
        let event: Stripe.Event;

        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }

        const payloadString = JSON.stringify(request.body, null, 2);

        const secret = configService.getOrThrow('STRIPE_SECRET_ENDPOINT');
        const header = this.stripe.webhooks.generateTestHeaderString({
            payload: payloadString,
            secret,
        });

        try {
            event = this.stripe.webhooks.constructEvent(payloadString, header, secret);
        } catch (err) {
            //@ts-ignore
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                await this.paymentService.handleSuccessfulPayment(session);
                break;

            case 'payment_intent.payment_failed':
                const failedSession = event.data.object as Stripe.PaymentIntent;
                await this.paymentService.handleFailedPayment(failedSession);
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        //@ts-ignore
        res.status(200).json({ received: true });
    }
}
