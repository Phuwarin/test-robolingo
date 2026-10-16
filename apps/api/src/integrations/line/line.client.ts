export async function line(path: string, options: RequestInit = {}) {
  const response = await fetch(`https://api.line.me/v2/bot/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`LINE request failed (${response.status})`);
  return response;
}
