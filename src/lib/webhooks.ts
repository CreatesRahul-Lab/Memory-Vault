import { connectDB } from "./db";
import Webhook from "@/models/Webhook";
import crypto from "crypto";

export async function triggerWebhooks(
  userId: string,
  event: string,
  payload: Record<string, unknown>
) {
  try {
    await connectDB();
    const webhooks = await Webhook.find({
      user: userId,
      active: true,
      events: event,
    });

    for (const webhook of webhooks) {
      const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(body)
        .digest("hex");

      try {
        const res = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
            "X-Webhook-Event": event,
          },
          body,
          signal: AbortSignal.timeout(10000),
        });

        if (res.ok) {
          webhook.lastTriggered = new Date();
          webhook.failCount = 0;
        } else {
          webhook.failCount += 1;
          if (webhook.failCount >= 10) webhook.active = false;
        }
        await webhook.save();
      } catch {
        webhook.failCount += 1;
        if (webhook.failCount >= 10) webhook.active = false;
        await webhook.save();
      }
    }
  } catch {
    // Webhook failures should not break the main flow
  }
}
