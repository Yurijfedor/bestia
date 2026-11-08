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

type PhotoAnalysis = {
  currentHair: string;
  observations: string[];
};

type AiHairstyleResponse = {
  photoAnalysis: PhotoAnalysis;
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
    const { hairLength, stylePreference, notes, imageDataUrl } = request.body;

    if (!hairLength || !stylePreference) {
      return response.status(400).json({
        error: "Необхідно вказати довжину волосся та бажаний стиль.",
      });
    }

    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return response.status(400).json({
        error: "Не вдалося отримати фото користувача.",
      });
    }

    console.log("Фото отримано. Розмір даних:", imageDataUrl.length);

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
  "photoAnalysis": {
    "currentHair": "Короткий опис волосся, яке видно на фотографії",
    "observations": [
      "Перша видима особливість волосся",
      "Друга видима особливість волосся"
    ]
  },
  "recommendations": [
    {
      "name": "Назва зачіски",
      "description": "Короткий опис",
      "whyItFits": "Чому ця зачіска підходить з урахуванням того, що видно на фотографії",
      "styling": "Як укладати зачіску"
    }
  ],
  "finalRecommendation": "Коротка головна рекомендація стиліста з урахуванням фото"
}

Запропонуй рівно 3 різні варіанти зачісок.
Спочатку коротко проаналізуй лише ті особливості волосся та зачіски, які реально видно на фотографії.

У полі "currentHair" дай короткий загальний опис поточного волосся.
У "observations" вкажи 2–4 конкретні видимі особливості, які ти врахував під час підбору.

У полі "whyItFits" для кожної рекомендації прямо поясни зв'язок між видимими особливостями волосся на фото та запропонованою зачіскою.

Не вигадуй характеристики, яких неможливо визначити за фотографією.
Аналізуй фотографію користувача лише в межах інформації, яка реально видима на зображенні.
Не додавай Markdown, пояснення або текст поза JSON.
      `,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Бажана довжина волосся: ${hairLength}
Бажаний стиль: ${stylePreference}
Додаткові побажання: ${notes || "немає"}

Проаналізуй фотографію користувача разом із його побажаннями.
Врахуй видиму довжину, текстуру та загальний вигляд волосся.
Не роби припущень про характеристики людини, яких неможливо надійно визначити з фотографії.
          `,
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
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
