import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error(
    "[Stripe] STRIPE_SECRET_KEY manquante — les fonctionnalités de paiement seront indisponibles.",
  );
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : (null as unknown as Stripe);
