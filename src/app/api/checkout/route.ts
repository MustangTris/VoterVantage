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
        const { priceId, amount, isDonation } = await req.json();

        const origin = req.headers.get("origin") || "http://localhost:3000";

        // Setup line items based on whether it's a fixed price (like a product) or a custom donation amount
        let line_items = [];

        if (amount) {
            // Custom Amount Donation
            line_items = [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Donation to Voter Vantage",
                            description: "Thank you for supporting transparency!",
                        },
                        unit_amount: amount * 100, // Stripe expects cents
                    },
                    quantity: 1,
                },
            ];
        } else if (priceId) {
            // Pre-defined Price ID (if you set up products in Stripe Dashboard)
            line_items = [{ price: priceId, quantity: 1 }];
        } else {
            return new NextResponse("Missing amount or priceId", { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/donate?canceled=true`,
        });

        return NextResponse.json(
            { url: session.url },
            {
                headers: corsHeaders,
            }
        );
    } catch (error) {
        console.error("[STRIPE_CHECKOUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
