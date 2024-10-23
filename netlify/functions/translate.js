import fetch from "node-fetch";

export async function handler(event) {
  const { text } = JSON.parse(event.body);

  const apiURL = "https://api-free.deepl.com/v2/translate";
  const apiKey = process.env.DEEPL_API_KEY;

  const payload = {
    text: [text],
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
      throw new Error(`Błąd: ${response.status}`);
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
