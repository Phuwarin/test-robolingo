import { validToken } from "../../common/security.js";
export function authorized(request: Request) {
  const secret = process.env.SESSION_SECRET;
  const cookie =
    request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("session="))
      ?.slice(8) || "";
  return !!secret && validToken(cookie, secret);
}
