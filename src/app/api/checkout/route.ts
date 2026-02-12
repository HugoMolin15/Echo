import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
    try {
        const { priceId } = await req.json();

        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

        if (!stripeSecretKey) {
            console.error('STRIPE_SECRET_KEY is not defined');
            return NextResponse.json(
                { error: 'Stripe Secret Key is missing. Please add STRIPE_SECRET_KEY to your Vercel Environment Variables.' },
                { status: 500 }
            );
        }

        const stripe = new Stripe(stripeSecretKey);

        if (!priceId) {
            return NextResponse.json(
                { error: 'Price ID is required' },
                { status: 400 }
            );
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json(
                { error: 'Stripe Secret Key is missing. Please add STRIPE_SECRET_KEY to your .env.local file.' },
                { status: 500 }
            );
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            payment_method_collection: 'always',
            success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Error creating checkout session:', err);
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}
