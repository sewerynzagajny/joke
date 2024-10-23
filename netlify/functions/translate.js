export async function handler(event) {
  let text;

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" }),
      };
    }

    const body = JSON.parse(event.body);
    text = body.text;

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Text to translate is required" }),
      };
    }
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON format" }),
    };
  }

  const apiURL = "https://api-free.deepl.com/v2/translate";
  const apiKey = process.env.DEEPL_API_KEY;

  const fetch = (await import("node-fetch")).default;

  const payload = {
    text: text,
    source_lang: "EN",
    target_lang: "PL",
  };

  try {
    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Błąd: ${data.message || response.status}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
