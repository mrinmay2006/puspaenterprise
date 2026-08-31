export async function onRequestPost(context) {
  const body = await context.request.json();

  const qty = Math.max(1, Number(body.quantity || 1));

  const rate =
    qty >= 11 ? 50 :
    qty >= 6 ? 60 :
    qty >= 3 ? 70 : 80;

  const delivery = qty >= 3 ? 0 : 40;
  const amount = qty * rate + delivery;

  const orderId =
    `PE${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.floor(Math.random() * 90000 + 10000)}`;

  return Response.json({
    ok: true,
    order_id: orderId,
    amount: amount,
    currency: "INR",
    payment_status: "PENDING",
    order_status: "ORDER_RECEIVED"
  });
}
