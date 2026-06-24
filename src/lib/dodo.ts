import DodoPayments from "dodopayments";

let _client: DodoPayments | null = null;

export function getDodoClient(): DodoPayments {
  if (!_client) {
    if (!process.env.DODO_PAYMENTS_API_KEY) throw new Error("DODO_PAYMENTS_API_KEY not set");
    _client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
    });
  }
  return _client;
}
