import "@supabase/functions-js/edge-runtime.d.ts";

const jsonHeaders = {
  "Content-Type": "application/json",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const expectedSecret = Deno.env.get("TELEGRAM_FUNCTION_SECRET");
  const providedSecret = req.headers.get("x-internal-secret");

  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

  if (!supabaseUrl || !serviceRoleKey || !botToken || !chatId) {
    return jsonResponse({ error: "Server configuration is incomplete" }, 500);
  }

  const restUrl = `${supabaseUrl}/rest/v1`;
  const dbHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };

  try {
    const claimResponse = await fetch(
      `${restUrl}/rpc/claim_pending_booking_notifications`,
      {
        method: "POST",
        headers: dbHeaders,
        body: JSON.stringify({}),
      },
    );

    if (!claimResponse.ok) {
      console.error("Queue claim failed:", claimResponse.status);
      return jsonResponse({ error: "Could not claim notifications" }, 502);
    }

    const queueItems = await claimResponse.json();

    if (!Array.isArray(queueItems)) {
      return jsonResponse({ error: "Invalid queue response" }, 502);
    }

    const results: Array<{ booking_id: string; status: string }> = [];

    for (const queueItem of queueItems) {
      const bookingId = queueItem.booking_id as string;
      const nextAttempts = Number(queueItem.attempts ?? 0) + 1;

      async function updateQueue(values: Record<string, unknown>) {
        const updateUrl = new URL(`${restUrl}/booking_notification_queue`);
        updateUrl.searchParams.set("id", `eq.${queueItem.id}`);

        return fetch(updateUrl, {
          method: "PATCH",
          headers: {
            ...dbHeaders,
            Prefer: "return=minimal",
          },
          body: JSON.stringify(values),
        });
      }

      try {
        const bookingUrl = new URL(`${restUrl}/bookings`);
        bookingUrl.searchParams.set("id", `eq.${bookingId}`);
        bookingUrl.searchParams.set(
          "select",
          "service_name,client_name,client_phone,booking_date,start_time,status",
        );

        const bookingResponse = await fetch(bookingUrl, {
          headers: dbHeaders,
        });

        if (!bookingResponse.ok) {
          const errorBody = await bookingResponse.text();

          console.error(
            "Booking lookup failed:",
            bookingResponse.status,
            errorBody,
          );

          await updateQueue({
            attempts: nextAttempts,
            claimed_at: null,
            last_error: `Booking lookup failed: ${bookingResponse.status}`,
          });

          results.push({ booking_id: bookingId, status: "lookup_failed" });
          continue;
        }

        const bookings = await bookingResponse.json();
        const booking = Array.isArray(bookings) ? bookings[0] : null;

        if (!booking || booking.status === "cancelled") {
          const skipped = await updateQueue({
            processed_at: new Date().toISOString(),
            attempts: nextAttempts,
            claimed_at: null,
            last_error: booking
              ? "Booking was cancelled before notification"
              : "Booking not found",
          });

          results.push({
            booking_id: bookingId,
            status: skipped.ok ? "skipped" : "queue_update_failed",
          });
          continue;
        }

        const message = [
          "📅 Нове бронювання — Бестія",
          "",
          `Послуга: ${booking.service_name}`,
          `Дата: ${booking.booking_date}`,
          `Час: ${String(booking.start_time).slice(0, 5)}`,
          `Клієнт: ${booking.client_name}`,
          `Телефон: ${booking.client_phone}`,
        ].join("\n");

        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
            }),
          },
        );

        if (!telegramResponse.ok) {
          await updateQueue({
            attempts: nextAttempts,
            claimed_at: null,
            last_error: `Telegram API status ${telegramResponse.status}`,
          });

          results.push({ booking_id: bookingId, status: "telegram_failed" });
          continue;
        }

        const completed = await updateQueue({
          processed_at: new Date().toISOString(),
          attempts: nextAttempts,
          claimed_at: null,
          last_error: null,
        });

        results.push({
          booking_id: bookingId,
          status: completed.ok ? "sent" : "sent_but_queue_update_failed",
        });
      } catch (error) {
        console.error(
          "Notification failed for booking:",
          error instanceof Error ? error.message : "Unknown error",
        );

        await updateQueue({
          attempts: nextAttempts,
          claimed_at: null,
          last_error: "Unexpected processing error",
        });

        results.push({ booking_id: bookingId, status: "error" });
      }
    }

    return jsonResponse({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error(
      "Notification processing failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return jsonResponse({ error: "Notification processing failed" }, 500);
  }
});
