const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { text } = JSON.parse(event.body);

  const apiURL = "https://api-free.deepl.com/v2/translate";
  const apiKey = "5d248dcc-0af5-4df1-9f03-afbd7e480113:fx";

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
};
