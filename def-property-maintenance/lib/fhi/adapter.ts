/**
 * FHI adapter for DEF Property Maintenance — Floor 17 interface only.
 * No live council connections. All methods are stubs pending FHI_COUNCIL_ENDPOINT provisioning.
 */
import 'server-only';

export const FHI_FLOOR = 17;
export const FHI_BRAND = 'DEF Property Maintenance';

export type DefLeadSummary = {
  leadId: string;
  propertyType: string;
  services: string[];
  location: string;
  customerName: string;
  email: string;
  timeline: string;
  createdAt: Date;
};

export type CouncilAdvisor = 'primedox' | 'vigilax' | 'soulstack';

export type CouncilRequest = {
  advisor: CouncilAdvisor;
  context: string;
  payload: Record<string, unknown>;
};

export type CouncilResponse = {
  advisor: CouncilAdvisor;
  recommendation: string;
  confidence: 'high' | 'medium' | 'low';
  flags: string[];
  requiresHumanReview: boolean;
};

/**
 * Interface stub for FHI AI Council.
 * All calls are no-ops until FHI_COUNCIL_ENDPOINT is configured and authorized.
 * Human authority required for consequential actions — never act autonomously on council output.
 */
export async function consultCouncil(req: CouncilRequest): Promise<CouncilResponse | null> {
  const endpoint = process.env.FHI_COUNCIL_ENDPOINT;
  if (!endpoint) return null;

  // Stub: In production, this would POST to the FHI council endpoint
  // with proper auth via FHI_COUNCIL_API_KEY.
  // Never auto-execute recommendations without human review.
  return null;
}

export function formatLeadForFHI(lead: DefLeadSummary): Record<string, unknown> {
  return {
    floor: FHI_FLOOR,
    brand: FHI_BRAND,
    leadId: lead.leadId,
    summary: `${lead.customerName} — ${lead.services.join(', ')} at ${lead.location}`,
    timeline: lead.timeline,
    createdAt: lead.createdAt.toISOString(),
  };
}
