import OpenAI from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type HairstyleRecommendation = {
  name: string;
  description: string;
  whyItFits: string;
  styling: string;
};

type AiHairstyleResponse = {
  recommendations: HairstyleRecommendation[];
  finalRecommendation: string;
};

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
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: `
Ти професійний стиліст-перукар. Допомагаєш підібрати зачіску.
Відповідай українською мовою.

Поверни виключно валідний JSON у такому форматі:

{
  "recommendations": [
    {
      "name": "Назва зачіски",
      "description": "Короткий опис",
      "whyItFits": "Чому ця зачіска може підійти",
      "styling": "Як укладати зачіску"
    }
  ],
  "finalRecommendation": "Коротка головна рекомендація стиліста"
}

Запропонуй рівно 3 різні варіанти зачісок.
Не додавай Markdown, пояснення або текст поза JSON.
          `,
        },
        {
          role: "user",
          content: `
Бажана довжина волосся: ${hairLength}
Бажаний стиль: ${stylePreference}
Додаткові побажання: ${notes || "немає"}
          `,
        },
      ],
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("AI не повернув рекомендацію.");
    }

    const result = JSON.parse(content) as AiHairstyleResponse;

    return response.status(200).json(result);
  } catch (error) {
    console.error("AI hairstyle generation error:", error);

    return response.status(500).json({
      error: "Не вдалося отримати рекомендацію від AI.",
    });
  }
}
