import axios from "axios";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(
  token,
  {
    secretKey = process.env.TURNSTILE_SECRET_KEY,
    remoteIp,
    request = (url, data, config) => axios.post(url, data, config),
  } = {},
) {
  if (!token || !secretKey) {
    return false;
  }

  try {
    const payload = new URLSearchParams({
      secret: secretKey,
      response: token,
    });
    if (remoteIp) {
      payload.set("remoteip", remoteIp);
    }

    const response = await request(TURNSTILE_VERIFY_URL, payload, { timeout: 5000 });
    return response.data?.success === true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Turnstile verification failed:", errorMessage);
    return false;
  }
}
