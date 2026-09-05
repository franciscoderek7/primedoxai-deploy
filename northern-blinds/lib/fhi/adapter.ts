/**
 * FHI Empire adapter — Northern Blinds Floor 17
 *
 * Exposes lead data to authorized FHI internal systems.
 * All exports are read-only. Write paths go through the consultation API.
 * This module never runs in the browser.
 */

export const FHI_FLOOR = 17;
export const FHI_BRAND = 'Northern Blinds';
export const FHI_EMPIRE_TOWER_LABEL = `A Francisco Holdings Inc. Production — Empire Tower — Floor ${FHI_FLOOR}`;

export interface NBLeadSummary {
  id: string;
  createdAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  projectType: string;
  products: string[];
  status: string;
}
