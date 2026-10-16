import { createHmac, timingSafeEqual } from "node:crypto";
export function equal(a: string, b: string) {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function validSignature(body: string, signature: string, secret: string) {
  return equal(createHmac("sha256", secret).update(body).digest("base64"), signature);
}
