const PRODUCTS = {
  "green-salsa": { name: "Dos Aztecas Green Salsa", unitAmount: 899 },
  "carne-asada": { name: "Dos Aztecas Carne Asada Marinade", unitAmount: 899 },
  "adobada-pastor": { name: "Dos Aztecas Adobada al Pastor", unitAmount: 899 }
};

const LOCAL_ZIPS = new Set(["06103", "06105", "06106", "06107", "06110", "06112", "06114", "06117", "06119", "06120"]);

function add(params, key, value) {
  params.append(key, String(value));
}

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  if (!process.env.STRIPE_SECRET_KEY) return response.status(503).json({ error: "Checkout is not connected yet." });

  const { items = [], fulfillment = "shipping", postalCode = "" } = request.body || {};
  const cleanItems = items
    .map(({ id, quantity }) => ({ product: PRODUCTS[id], quantity: Math.max(1, Math.min(10, Number(quantity) || 0)) }))
    .filter(({ product, quantity }) => product && quantity);

  if (!cleanItems.length) return response.status(400).json({ error: "Your cart is empty." });
  if (fulfillment === "local" && !LOCAL_ZIPS.has(String(postalCode).trim())) {
    return response.status(400).json({ error: "Local drop-off is currently available only in the Hartford and West Hartford delivery area." });
  }

  const origin = request.headers.origin || "https://dos-aztecas.vercel.app";
  const params = new URLSearchParams();
  add(params, "mode", "payment");
  add(params, "success_url", `${origin}/?order=success`);
  add(params, "cancel_url", `${origin}/?order=cancelled#products`);
  add(params, "billing_address_collection", "auto");
  add(params, "shipping_address_collection[allowed_countries][0]", "US");
  add(params, "phone_number_collection[enabled]", "true");
  add(params, "allow_promotion_codes", "true");
  add(params, "metadata[fulfillment]", fulfillment);
  if (fulfillment === "local") add(params, "metadata[requested_postal_code]", postalCode);

  cleanItems.forEach(({ product, quantity }, index) => {
    add(params, `line_items[${index}][price_data][currency]`, "usd");
    add(params, `line_items[${index}][price_data][unit_amount]`, product.unitAmount);
    add(params, `line_items[${index}][price_data][product_data][name]`, product.name);
    add(params, `line_items[${index}][quantity]`, quantity);
  });

  const shippingName = fulfillment === "local" ? "Local drop-off (Hartford area)" : "Standard U.S. shipping";
  const shippingAmount = fulfillment === "local" ? 399 : 799;
  add(params, "shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  add(params, "shipping_options[0][shipping_rate_data][fixed_amount][amount]", shippingAmount);
  add(params, "shipping_options[0][shipping_rate_data][fixed_amount][currency]", "usd");
  add(params, "shipping_options[0][shipping_rate_data][display_name]", shippingName);
  add(params, "shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]", "business_day");
  add(params, "shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]", fulfillment === "local" ? 1 : 3);
  add(params, "shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]", "business_day");
  add(params, "shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]", fulfillment === "local" ? 2 : 5);

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });
  const session = await stripeResponse.json();
  if (!stripeResponse.ok) return response.status(400).json({ error: session.error?.message || "Unable to start checkout." });
  return response.status(200).json({ url: session.url });
}
