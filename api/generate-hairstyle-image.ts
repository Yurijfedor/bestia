import OpenAI, { toFile } from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Hairstyle = {
  name: string;
  description: string;
  whyItFits: string;
  styling: string;
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
    const { image, hairstyle } = request.body as {
      image?: string;
      hairstyle?: Hairstyle;
    };

    if (!image || !hairstyle) {
      return response.status(400).json({
        error: "Необхідно передати фото та обраний варіант зачіски.",
      });
    }

    const base64Data = image.split(",")[1];

    if (!base64Data) {
      return response.status(400).json({
        error: "Невірний формат зображення.",
      });
    }

    const imageBuffer = Buffer.from(base64Data, "base64");

    const imageFile = await toFile(imageBuffer, "hairstyle-reference.png", {
      type: "image/png",
    });

    const prompt = `
Використай завантажене фото людини як основу.

Створи реалістичну візуалізацію того, як ця сама людина може
виглядати з новою зачіскою.

ВАЖЛИВО:
- збережи ту саму людину та її впізнавані риси обличчя;
- максимально збережи ракурс, позу, освітлення та фон оригінального фото;
- змінюй переважно зачіску;
- результат має виглядати як реалістична фотографія, а не ілюстрація.

Обрана зачіска:
Назва: ${hairstyle.name}
Опис: ${hairstyle.description}
Рекомендації щодо укладання: ${hairstyle.styling}
    `.trim();

    const result = await openai.images.edit({
      model: "gpt-image-2.5-sunburst",
      image: imageFile,
      prompt,
      quality: "medium",
      size: "1024x1024",
      output_format: "png",
    });

    const generatedImage = result.data?.[0]?.b64_json;

    if (!generatedImage) {
      throw new Error("AI не повернув згенероване зображення.");
    }

    return response.status(200).json({
      image: `data:image/png;base64,${generatedImage}`,
    });
  } catch (error) {
    console.error("Hairstyle image generation error:", error);

    return response.status(500).json({
      error: "Не вдалося згенерувати зображення зачіски.",
    });
  }
}
