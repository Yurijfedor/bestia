export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Метод не підтримується." }, { status: 405 });
  }

  try {
    const formData = await request.formData();

    const photo = formData.get("photo");
    const hairLength = formData.get("hairLength");
    const stylePreference = formData.get("stylePreference");
    const notes = formData.get("notes");

    if (!(photo instanceof File)) {
      return Response.json(
        { error: "Будь ласка, завантажте фото." },
        { status: 400 },
      );
    }

    if (!hairLength || !stylePreference) {
      return Response.json(
        { error: "Будь ласка, заповніть усі обов'язкові поля." },
        { status: 400 },
      );
    }

    // Тимчасово лише перевіряємо отримані дані.
    return Response.json({
      success: true,
      message: "Дані успішно отримано сервером.",
      received: {
        fileName: photo.name,
        fileType: photo.type,
        fileSize: photo.size,
        hairLength,
        stylePreference,
        notes,
      },
    });
  } catch {
    return Response.json(
      { error: "Не вдалося обробити запит." },
      { status: 500 },
    );
  }
}
