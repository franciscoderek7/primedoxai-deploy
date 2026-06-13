import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, domain } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const domainResponses: Record<string, string> = {
      legal:    `I'm PrimeDox AI analyzing your legal query: "${message}". The full constitutional cannabis law engine launches July 2026. Pre-order now for priority access to automated motion drafting, case strategy, and charter analysis.`,
      cyber:    `I'm VIGILAX scanning your security query: "${message}". The full threat intelligence engine launches July 2026. Pre-order for enterprise-grade protection.`,
      safety:   `I'm OmniaGuard processing your public safety query: "${message}". The full first responder AI launches July 2026. Pre-order for departmental deployment.`,
      business: `I'm Francisco Holdings AI analyzing: "${message}". The full empire management engine launches July 2026. Pre-order for strategic intelligence.`,
      general:  `I'm zPrimeDox AI HQ. You asked: "${message}". The complete intelligence engine with all five powers launches July 2026. Get early access now.`,
    };

    const response = domainResponses[domain || "general"] || domainResponses.general;

    return NextResponse.json({
      response,
      domain: domain || "general",
      timestamp: new Date().toISOString(),
      note: "Full AI engine launching July 2026. Pre-order at zprimedoxaihq.com",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", response: "The AI engine is warming up. Try again shortly." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "zPrimeDox AI HQ Chat API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
}
