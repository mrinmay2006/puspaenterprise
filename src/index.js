export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health" && request.method === "GET") {
      try {
        await env.DB.prepare("SELECT 1").first();
        return json({ ok: true, database: "connected" });
      } catch (e) {
        return json({ ok: false, error: e.message }, 500);
      }
    }

    if (url.pathname === "/api/orders" && request.method === "POST") {
      try {
        const b = await request.json();

        const service = String(b.service || "").trim();
        const name = String(b.name || "").trim();
        const phone = String(b.phone || "").trim();
        const email = String(b.email || "").trim();
        const address = String(b.address || "").trim();
        const notes = String(b.notes || "").trim();

        if (!service || !name || !phone) {
          return json({ ok: false, error: "Name, phone and service are required" }, 400);
        }

        const orderNo =
          "PE-" +
          Date.now().toString(36).toUpperCase() +
          "-" +
          Math.floor(100 + Math.random() * 900);

        /*
          Your existing D1 orders table has some old required columns:
          card_type, quantity, rate, delivery_charge, pin.
          We fill those with safe defaults so the old schema also works.
        */
        await env.DB.prepare(`
          INSERT INTO orders (
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
            tracking_number,
            created_at,
            order_no,
            service,
            email,
            notes
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          service,
          1,
          0,
          0,
          0,
          name,
          phone,
          address,
          "",
          "PENDING",
          "ORDER_RECEIVED",
          null,
          new Date().toISOString(),
          orderNo,
          service,
          email,
          notes
        ).run();

        return json({
          ok: true,
          order_no: orderNo,
          message: "Request received successfully"
        });
      } catch (e) {
        return json({
          ok: false,
          error: e.message || "Database error"
        }, 500);
      }
    }

    if (url.pathname === "/api/contact" && request.method === "POST") {
      try {
        const b = await request.json();

        const name = String(b.name || "").trim();
        const phone = String(b.phone || "").trim();
        const email = String(b.email || "").trim();
        const message = String(b.message || "").trim();

        if (!name || !phone || !message) {
          return json({ ok: false, error: "Required fields missing" }, 400);
        }

        await env.DB.prepare(`
          INSERT INTO contacts (name, phone, email, message, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          name,
          phone,
          email,
          message,
          new Date().toISOString()
        ).run();

        return json({ ok: true, message: "Message received successfully" });
      } catch (e) {
        return json({ ok: false, error: e.message || "Database error" }, 500);
      }
    }

    if (url.pathname === "/api/orders" && request.method === "GET") {
      if (!authorized(request, env)) {
        return json({ ok: false, error: "Unauthorized" }, 401);
      }

      const r = await env.DB.prepare(
        "SELECT * FROM orders ORDER BY id DESC LIMIT 200"
      ).all();

      return json({ ok: true, orders: r.results || [] });
    }

    if (url.pathname === "/api/contact" && request.method === "GET") {
      if (!authorized(request, env)) {
        return json({ ok: false, error: "Unauthorized" }, 401);
      }

      const r = await env.DB.prepare(
        "SELECT * FROM contacts ORDER BY id DESC LIMIT 200"
      ).all();

      return json({ ok: true, contacts: r.results || [] });
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Puspa Enterprise Worker is running.", {
      status: 500
    });
  }
};

function authorized(request, env) {
  const token = env.ADMIN_TOKEN;
  return !!token &&
    request.headers.get("Authorization") === `Bearer ${token}`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}
