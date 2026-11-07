import OpenAI from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { hairLength, stylePreference, notes } = request.body;

    if (!hairLength || !stylePreference) {
      return response.status(400).json({
        error: "Необхідно вказати довжину волосся та бажаний стиль.",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Ти професійний стиліст-перукар. Допомагаєш підібрати зачіску. Відповідай українською мовою, доброзичливо та конкретно.",
        },
        {
          role: "user",
          content: `
Клієнт хоче підібрати нову зачіску.

Бажана довжина волосся: ${hairLength}
Бажаний стиль: ${stylePreference}
Додаткові побажання: ${notes || "немає"}

Запропонуй 3 варіанти зачіски. Для кожного коротко поясни:
- назву або опис зачіски;
- чому вона може підійти;
- як її укладати.

Наприкінці дай коротку рекомендацію, який варіант варто спробувати першим.
          `,
        },
      ],
      max_tokens: 700,
    });

    const result = completion.choices[0]?.message?.content;

    if (!result) {
      throw new Error("AI не повернув рекомендацію.");
    }

    return response.status(200).json({
      message: result,
    });
  } catch (error) {
    console.error("AI hairstyle generation error:", error);

    return response.status(500).json({
      error: "Не вдалося отримати рекомендацію від AI.",
    });
  }
}
