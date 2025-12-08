import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
    try {
        const { priceId, amount, isDonation, isRecurring } = await req.json();

        // Use headers() to get origin if needed, or default
        const origin = req.headers.get("origin") || "http://localhost:3000";

        // Setup line items
        let line_items = [];

        if (amount) {
            // Custom Amount Donation
            const product_data = {
                name: "Donation to Voter Vantage",
                description: isRecurring ? "Monthly donation to support transparency!" : "Thank you for supporting transparency!",
            };

            const price_data: any = {
                currency: "usd",
                product_data,
                unit_amount: amount * 100, // Stripe expects cents
            };

            if (isRecurring) {
                price_data.recurring = {
                    interval: "month",
                };
            }

            line_items = [
                {
                    price_data,
                    quantity: 1,
                },
            ];
        } else if (priceId) {
            line_items = [{ price: priceId, quantity: 1 }];
        } else {
            return new NextResponse("Missing amount or priceId", { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: isRecurring ? "subscription" : "payment",
            ui_mode: 'embedded',
            return_url: `${origin}/donate/return?session_id={CHECKOUT_SESSION_ID}`,
        });

        return NextResponse.json(
            { clientSecret: session.client_secret },
            {
                headers: corsHeaders,
            }
        );
    } catch (error) {
        console.error("[STRIPE_CHECKOUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
