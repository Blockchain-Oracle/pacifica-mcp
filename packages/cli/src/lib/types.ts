// ── Market Data ──────────────────────────────────────────────────────────────

export interface MarketInfo {
  symbol: string;
  tick_size: string;
  min_tick: string;
  max_tick: string;
  lot_size: string;
  max_leverage: number;
  isolated_only: boolean;
  min_order_size: string;
  max_order_size: string;
  funding_rate: string;
  next_funding_rate: string;
  created_at: number;
}

export interface PriceInfo {
  symbol: string;
  mark: string;
  oracle: string;
  mid: string;
  funding: string;
  next_funding: string;
  open_interest: string;
  volume_24h: string;
  timestamp: number;
  yesterday_price: string;
}

// Raw API shapes (single-letter keys from Pacifica wire format)
export interface RawCandle {
  t: number;
  T: number;
  s: string;
  i: string;
  o: string;
  c: string;
  h: string;
  l: string;
  v: string;
  n: number;
}

export interface RawOrderBookLevel {
  p: string;
  a: string;
  n: number;
}

export interface RawOrderBook {
  s: string;
  l: [RawOrderBookLevel[], RawOrderBookLevel[]];
  t: string;
}

// Normalized shapes (human/AI-readable keys returned by tools)
export interface Candle {
  open_time: number;
  close_time: number;
  symbol: string;
  interval: string;
  open: string;
  close: string;
  high: string;
  low: string;
  volume: string;
  trade_count: number;
}

export interface OrderBookLevel {
  price: string;
  amount: string;
  num_orders: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: string;
}

export interface RecentTrade {
  event_type: string;
  price: string;
  amount: string;
  side: string;
  cause: string;
  created_at: number;
}

export interface FundingRateHistory {
  oracle_price: string;
  bid_impact_price: string;
  ask_impact_price: string;
  funding_rate: string;
  next_funding_rate: string;
  created_at: number;
}

// ── Account ─────────────────────────────────────────────────────────────────

export interface AccountInfo {
  balance: string;
  fee_level: number;
  maker_fee: string;
  taker_fee: string;
  account_equity: string;
  available_to_spend: string;
  available_to_withdraw: string;
  pending_balance: string;
  total_margin_used: string;
  cross_mmr: string;
  positions_count: number;
  orders_count: number;
  stop_orders_count: number;
  updated_at: number;
  use_ltp_for_stop_orders: boolean;
}

export interface AccountSettings {
  auto_lend_disabled: boolean | null;
  margin_settings: MarginSetting[];
  spot_settings: unknown[];
}

export interface MarginSetting {
  symbol: string;
  isolated: boolean;
  leverage: number;
  created_at: number;
  updated_at: number;
}

export interface Position {
  symbol: string;
  side: string;
  amount: string;
  entry_price: string;
  margin: string;
  funding: string;
  isolated: boolean;
  created_at: number;
  updated_at: number;
}

export interface TradeRecord {
  history_id: number;
  order_id: number;
  client_order_id: string | null;
  symbol: string;
  amount: string;
  price: string;
  entry_price: string;
  fee: string;
  pnl: string;
  event_type: string;
  side: string;
  created_at: number;
  cause: string;
}

export interface FundingPayment {
  history_id: number;
  symbol: string;
  side: string;
  amount: string;
  payout: string;
  rate: string;
  created_at: number;
}

export interface EquityPoint {
  account_equity: string;
  pnl: string;
  timestamp: number;
}

export interface BalanceEvent {
  amount: string;
  balance: string;
  pending_balance: string;
  event_type: string;
  created_at: number;
}

// ── Orders ──────────────────────────────────────────────────────────────────

export interface OpenOrder {
  order_id: number;
  client_order_id: string | null;
  symbol: string;
  side: string;
  price: string;
  initial_amount: string;
  filled_amount: string;
  cancelled_amount: string;
  stop_price: string | null;
  order_type: string;
  stop_parent_order_id: number | null;
  reduce_only: boolean;
  created_at: number;
  updated_at: number;
}

export interface OrderHistoryRecord {
  order_id: number;
  client_order_id: string | null;
  symbol: string;
  side: string;
  initial_price: string;
  average_filled_price: string;
  amount: string;
  filled_amount: string;
  order_status: string;
  order_type: string;
  stop_price: string | null;
  stop_parent_order_id: number | null;
  reduce_only: boolean;
  reason: string | null;
  created_at: number;
  updated_at: number;
}

export interface OrderHistoryById {
  history_id: number;
  order_id: number;
  client_order_id: string | null;
  symbol: string;
  side: string;
  price: string;
  initial_amount: string;
  filled_amount: string;
  cancelled_amount: string;
  event_type: string;
  order_type: string;
  order_status: string;
  stop_price: string | null;
  stop_parent_order_id: number | null;
  reduce_only: boolean;
  created_at: number;
}

export interface OrderResponse {
  order_id: number;
}

export interface CancelAllResponse {
  cancelled_count: number;
}

export interface BatchResult {
  success: boolean;
  order_id?: number;
  error?: string;
}

export interface BatchResponse {
  results: BatchResult[];
}

// ── Subaccounts ─────────────────────────────────────────────────────────────

export interface SubaccountInfo {
  address: string;
  balance: string;
  pending_balance: string;
  fee_level: number;
  fee_mode: string;
  use_ltp_for_stop_orders: boolean;
  created_at: number;
}

// ── Pagination wrapper ──────────────────────────────────────────────────────

export interface Paginated<T> {
  data: T[];
  next_cursor?: string;
  has_more?: boolean;
}
