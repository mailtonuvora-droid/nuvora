import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "npm:nodemailer";

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
}

serve(async (req) => {
  try {
    const payload: OrderPayload = await req.json();
    const order = payload.record;

    console.log(`Processing order: ${order.id}`);

    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error("SMTP_USER or SMTP_PASS not set in Edge Function Secrets");
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
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
    `;

    await transporter.sendMail({
      from: `"Nuvora Orders" <${SMTP_USER}>`,
      to: RECIPIENT_EMAIL,
      subject: `🔔 New Order Received: #${order.id}`,
      text: emailBody,
    });

    console.log(`✅ Email sent successfully for order ${order.id}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
