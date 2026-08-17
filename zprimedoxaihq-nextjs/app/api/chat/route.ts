import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, domain } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const domainResponses: Record<string, string> = {
      legal:    `I'm PrimeDox AI analyzing your legal query: "${message}". PrimeDox AI provides document intelligence and legal-education workflow assistance. Review all generated material before use.`,
      cyber:    `I'm VIGILAX scanning your security query: "${message}". Cybersecurity intelligence and protection capabilities are being developed for enterprise deployment.`,
      safety:   `I'm OmniaGuard processing your public safety query: "${message}". Public-safety workflow capabilities are being developed for organizational deployment.`,
      business: `I'm Francisco Holdings AI analyzing: "${message}". Francisco Holdings AI provides an intelligent interface for business and workflow operations.`,
      general:  `I'm zPrimeDox AI HQ. You asked: "${message}". PrimeDox AI HQ is the document-intelligence foundation of the Phoenix Core ecosystem.`,
    };

    const response = domainResponses[domain || "general"] || domainResponses.general;

    return NextResponse.json({
      response,
      domain: domain || "general",
      timestamp: new Date().toISOString(),
      note: "PrimeDox AI HQ — production development and deployment platform.",
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
