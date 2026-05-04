import crypto from "crypto";

const BASE_URL = process.env.NODE_ENV === "production"
  ? "https://payment.amalsholeh.com/api/v1"
  : "https://payment.amalsholeh.com/api/dev";

export function generateSignature(invoiceCode: string, amount: number): string {
  const merchantCode = process.env.AMSHOLPAY_MERCHANT_CODE!;
  const privateKey  = process.env.AMSHOLPAY_PRIVATE_KEY!;
  const raw = merchantCode + "qris" + invoiceCode + amount;
  return crypto.createHmac("sha256", privateKey).update(raw).digest("hex");
}

export function verifyCallbackSignature(body: {
  payment_method: string;
  merchant_ref: string;
  amount: number;
  signature: string;
}): boolean {
  const merchantCode = process.env.AMSHOLPAY_MERCHANT_CODE!;
  const privateKey  = process.env.AMSHOLPAY_PRIVATE_KEY!;
  const raw = merchantCode + body.payment_method + body.merchant_ref + body.amount;
  const expected = crypto.createHmac("sha256", privateKey).update(raw).digest();
  const actual   = Buffer.from(body.signature ?? "", "hex");
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

export async function createQrisPayment(params: {
  trxId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  description: string;
}) {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AMSHOLPAY_API_KEY}`,
    },
    body: JSON.stringify({
      merchant_code:  process.env.AMSHOLPAY_MERCHANT_CODE,
      customer_name:  params.customerName,
      customer_phone: "628000000000",
      customer_email: params.customerEmail,
      trx_id:         params.trxId,
      payment_method: "qris",
      amount:         params.amount,
      description:    params.description,
    }),
  });

  if (!res.ok) throw new Error(`AmsholPay error: ${res.status}`);
  return res.json() as Promise<{
    status: boolean;
    data: {
      reference: string;
      merchant_ref: string;
      payment_method: string;
      amount: number;
      pay_code: string;
      qr_string: string;
      pay_url: string | null;
      instructions: { title: string; steps: string[] }[];
    };
  }>;
}
