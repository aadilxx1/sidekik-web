// Mirror of `InvoiceState` and `DomEvent` from @sidekik/contracts (sidekik-platform
// src/contracts/screen.ts). sidekik-platform is a private repo that Lovable's build can't
// install, so these two types are copied here. Keep them identical to the zod schemas there.

export interface InvoiceState {
  invoice_id?: string;
  supplier?: string;
  supplier_known?: boolean;
  net_amount?: number;
  currency?: string;
  invoice_date?: string;
  invoice_month?: number;
  company_code?: string;
  category?: string;
  cost_center?: string;
  asset_number?: string;
  approvals_count?: number;
}

export interface DomEvent {
  kind: "field_focus" | "field_change" | "save_attempt" | "record_open";
  record?: { kind: string; id: string };
  field?: string;
  before?: string;
  after?: string;
  state?: InvoiceState;
}
