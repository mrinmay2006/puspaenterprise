export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API: create PVC order
    if (url.pathname === "/api/orders" && request.method === "POST") {
      try {
        const body = await request.json();

        const quantity = Math.max(1, Number(body.quantity || 1));

        const rate =
          quantity >= 11 ? 50 :
          quantity >= 6 ? 60 :
          quantity >= 3 ? 70 : 80;

        const delivery = quantity >= 3 ? 0 : 40;
        const amount = quantity * rate + delivery;

        const orderId =
          "PE" +
          new Date().toISOString().slice(0, 10).replaceAll("-", "") +
          "-" +
          Math.floor(Math.random() * 90000 + 10000);

        await env.DB.prepare(`
          INSERT INTO orders (
            id,
            card_type,
            quantity,
            rate,
            delivery_charge,
            amount,
            customer_name,
            mobile,
            address,
            pin,
            payment_status,
            order_status,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          orderId,
          body.card_type || "PVC Card",
          quantity,
          rate,
          delivery,
          amount,
          body.customer_name || "",
          body.mobile || "",
          body.address || "",
          body.pin || "",
          "PENDING",
          "ORDER_RECEIVED",
          new Date().toISOString()
        ).run();

        return Response.json({
          success: true,
          order_id: orderId,
          amount,
          currency: "INR",
          payment_status: "PENDING",
          order_status: "ORDER_RECEIVED"
        });
      } catch (error) {
        return Response.json(
          {
            success: false,
            error: error.message
          },
          { status: 500 }
        );
      }
    }

    // API: track order
    if (url.pathname.startsWith("/api/orders/") && request.method === "GET") {
      const orderId = url.pathname.split("/").pop();

      const result = await env.DB
        .prepare("SELECT * FROM orders WHERE id = ?")
        .bind(orderId)
        .first();

      if (!result) {
        return Response.json(
          { success: false, error: "Order not found" },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        order: result
      });
    }

    // Website files
    return env.ASSETS.fetch(request);
  }
};
