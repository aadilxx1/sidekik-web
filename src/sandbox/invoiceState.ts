import type { InvoiceState } from "./contract";

/** A MiniERP invoice row as stored in invoices.json. */
export interface SandboxInvoice {
  invoice_id: string;
  supplier: string;
  supplier_known: boolean;
  company_code: string;
  invoice_date: string;
  net_amount: number;
  currency: string;
  category: string;
  cost_center: string;
  asset_number: string;
  approvals_count: number;
  description: string;
  status: string;
  tutor_case: boolean;
}

/**
 * The normalized state the guardrails are evaluated on (ARCHITECTURE Appendix B: only these
 * variables are allowed in JSON-Logic). Adds invoice_month for G4; drops UI-only fields.
 */
export function toInvoiceState(inv: SandboxInvoice): InvoiceState {
  const state: InvoiceState = {
    invoice_id: inv.invoice_id,
    supplier: inv.supplier,
    supplier_known: inv.supplier_known,
    net_amount: inv.net_amount,
    currency: inv.currency,
    invoice_date: inv.invoice_date,
    company_code: inv.company_code,
    category: inv.category,
    cost_center: inv.cost_center,
    approvals_count: inv.approvals_count,
  };
  const month = Number(inv.invoice_date.slice(5, 7));
  if (month >= 1 && month <= 12) state.invoice_month = month;
  const asset = inv.asset_number.trim();
  if (asset) state.asset_number = asset;
  return state;
}
