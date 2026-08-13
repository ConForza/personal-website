import assert from "node:assert/strict";
import test from "node:test";

import { verifyTurnstileToken } from "../services/turnstileService.js";

test("accepts a successful Turnstile verification", async () => {
  let requestArgs;
  const result = await verifyTurnstileToken("token", {
    secretKey: "secret",
    remoteIp: "203.0.113.10",
    request: async (...args) => {
      requestArgs = args;
      return { data: { success: true } };
    },
  });

  assert.equal(result, true);
  assert.equal(requestArgs[1].get("secret"), "secret");
  assert.equal(requestArgs[1].get("response"), "token");
  assert.equal(requestArgs[1].get("remoteip"), "203.0.113.10");
});

test("rejects an unsuccessful Turnstile verification", async () => {
  const result = await verifyTurnstileToken("token", {
    secretKey: "secret",
    request: async () => ({ data: { success: false } }),
  });

  assert.equal(result, false);
});

test("rejects missing credentials without making a verification request", async () => {
  let requested = false;
  const result = await verifyTurnstileToken("", {
    secretKey: "secret",
    request: async () => {
      requested = true;
      return { data: { success: true } };
    },
  });

  assert.equal(result, false);
  assert.equal(requested, false);
});
