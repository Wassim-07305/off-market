import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    openrouter: !!(process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY),
    unipile: !!process.env.UNIPILE_API_KEY,
    stripe: !!process.env.STRIPE_SECRET_KEY,
  });
}
