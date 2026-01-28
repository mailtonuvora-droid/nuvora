import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const SMTP_USER = Deno.env.get("SMTP_USER");
const SMTP_PASS = Deno.env.get("SMTP_PASS");
const RECIPIENT_EMAIL = "saravanavenkatachalam@gmail.com";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderPayload {
  type: 'INSERT';
  table: string;
  record: {
    id: string;
    total_amount: number;
    shipping_address: string;
    items: OrderItem[];
    created_at: string;
    status: string;
  };
  old_record: null;
}

serve(async (req) => {
  try {
    const payload: OrderPayload = await req.json();
    const order = payload.record;

    console.log(`Processing order: ${order.id}`);

    const client = new SmtpClient();
    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: SMTP_USER!,
      password: SMTP_PASS!,
    });

    const itemsList = order.items
      .map((item) => `${item.name} x ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`)
      .join("\n");

    const emailBody = `
New Order Received!

Order Details:
--------------
Order ID: ${order.id}
Date: ${new Date(order.created_at).toLocaleString('en-IN')}
Total Amount: ₹${order.total_amount.toFixed(2)}
Status: ${order.status}

Shipping Address:
-----------------
${order.shipping_address}

Items:
------
${itemsList}

View in Admin Panel: ${req.headers.get("origin") || "Nuvora Admin"}
    `;

    await client.send({
      from: SMTP_USER!,
      to: RECIPIENT_EMAIL,
      subject: `🔔 New Order Received: #${order.id}`,
      content: emailBody,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
