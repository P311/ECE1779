/**
 * Real SendGrid integration test — not a Jest spec.
 * Run with:
 *   npx ts-node tests/services/test-email.ts
 *
 * Loads sendgrid.env automatically. Also set:
 *   EMAIL_USER        — verified sender address in your SendGrid account
 *   TEST_EMAIL_TO     — recipient address for the test email
 */

import * as fs from "fs";
import * as path from "path";

// Parse sendgrid.env (bash export syntax: export KEY='value')
// Handles both UTF-8 and UTF-16 LE (Windows default encoding)
const envFile = path.resolve(__dirname, "../../sendgrid.env");
if (fs.existsSync(envFile)) {
  const buf = fs.readFileSync(envFile);
  // Detect UTF-16 LE BOM (FF FE)
  const content = (buf[0] === 0xff && buf[1] === 0xfe)
    ? buf.slice(2).toString("utf16le")
    : buf.toString("utf-8");
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^export\s+([^=]+)='([^']*)'\s*$/);
    if (match) {
      const [, key, value] = match;
      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
}

import { makeEmailNotifier } from "../../src/services/email";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`ERROR: environment variable ${name} is not set.`);
    process.exit(1);
  }
  return value;
}

async function main() {
  requireEnv("SENDGRID_API_KEY");
  requireEnv("EMAIL_USER");
  const to = requireEnv("TEST_EMAIL_TO");

  console.log(`Sending test email to ${to} via SendGrid...`);

  const notifier = makeEmailNotifier();
  await notifier.send(
    to,
    "SendGrid integration test",
    "If you received this, your API key and sender address are working correctly."
  );

  console.log("SUCCESS: email accepted by SendGrid (HTTP 202).");
}

main().catch((err: unknown) => {
  console.error("FAILED:", err);
  process.exit(1);
});
