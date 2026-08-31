CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  card_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  rate INTEGER NOT NULL,
  delivery_charge INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  address TEXT NOT NULL,
  pin TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'PENDING',
  order_status TEXT NOT NULL DEFAULT 'ORDER_RECEIVED',
  tracking_number TEXT,
  created_at TEXT NOT NULL
);
