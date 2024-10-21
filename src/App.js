import { useState } from "react";
import { useEffect } from "react";

const language = [
  { id: 0, value: "pl", descriptionPl: "Polski", descriptionEN: "Polish" },
  { id: 1, value: "en", descriptionPl: "Angielski", descriptionEN: "English" },
];

const limitMessages = [
  { id: 10, type: "single", jokeText: "Został osiągnięty dzienny limit" },
  {
    id: 11,
    type: "single",
    jokeText: "Niestety musisz samodzielnie wymyśleć żart",
  },
  { id: 12, type: "single", jokeText: "Nie klikaj. Nic to nie da. Wróć jutro" },
  { id: 13, type: "single", jokeText: "Serio wróc jutro! Starczy na dziś" },
  { id: 14, type: "single", jokeText: "Wróć jutro!" },
];

function Timeout(s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
}

async function AJAX(
  url,
  uploadData = undefined,
  KeyName = undefined,
  authKey = undefined,
  contentType = "application/json"
) {
  try {
    const headers = { "Content-Type": contentType };

    if (authKey) {
      headers["Authorization"] = `${KeyName} ${authKey}`;
    }

    let body;
    if (uploadData) {
      if (contentType === "application/json") {
        body = JSON.stringify(uploadData);
      } else if (contentType === "application/x-www-form-urlencoded") {
        body = new URLSearchParams(uploadData).toString();
      }
    }

    const fetchPro = fetch(url, {
      method: uploadData ? "POST" : "GET",
      headers: headers,
      body: body,
    });

    const res = await Promise.race([fetchPro, Timeout(10)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} ${res.status}`);
    return data;
  } catch (err) {
    console.error("Error in AJAX function:", err);
    throw err;
  }
}

function Button({ onClick, children }) {
  return (
    <button className="btn" onClick={onClick}>
      <span className="btn__text">{children}</span>
    </button>
  );
}

export default function App() {
  const [select, setSelect] = useState(() => {
    const savedSelect = localStorage.getItem("select");
    return savedSelect ? savedSelect : "pl"; // Fallback na "pl"
  });

  const [joke, setJoke] = useState({});
  const [idCounter, setIdCounter] = useState(0);

  useEffect(() => {
    localStorage.setItem("select", select);
  }, [select]);

  // useEffect(() => {
  //   // Logowanie aktualnego stanu żartów po każdej aktualizacji
  //   console.log("Updated jokes:", jokes);
  // }, [jokes]);

  function handleGetJoke() {
    getJokeFromAPI();
    // getTranslationFromAPI();
  }

  async function getJokeFromAPI() {
    const apiURL = "https://v2.jokeapi.dev/joke/Any";
    try {
      if (idCounter >= 10 && idCounter < 15) {
        setIdCounter((prev) => prev + 1);
        setJoke(limitMessages[idCounter - 10]);
        return;
      }

      if (idCounter >= 15) {
        setJoke(limitMessages[4]);
        return;
      }

      const data = await AJAX(apiURL);
      const jokeText = data.joke || `${data.setup} ${data.delivery}`;

      if (!jokeText) {
        console.error("No joke text returned from API.");
        return;
      }
      setIdCounter((prev) => prev + 1);

      if (select === "en") setJoke({ jokeText: jokeText, id: idCounter });
      else if (select === "pl")
        await getTranslationFromAPI(jokeText, idCounter);
    } catch (err) {
      console.error(`${err} ❌❌❌`);
      throw err;
    }
  }

  async function getTranslationFromAPI(jokeText, id) {
    // const apiURL = "https://api-free.deepl.com/v2/translate";
    const apiURL =
      "https://cors-anywhere.herokuapp.com/https://api-free.deepl.com/v2/translate";
    const apiKey = "5d248dcc-0af5-4df1-9f03-afbd7e480113:fx";
    const apiName = "DeepL-Auth-Key";
    const payload = {
      text: [jokeText],
      source_lang: "EN",
      target_lang: "PL",
    };
    try {
      const data = await AJAX(apiURL, payload, apiName, apiKey);
      console.log("Translation response:", data);
      const translateText = data.translations[0].text;
      setJoke({ jokeText: translateText, id });
      console.log(joke);
    } catch (err) {
      console.error(`${err} ❌❌❌`);
      throw err;
    }
  }

  return (
    <div className="app">
      <Logo select={select} />
      <JokingText joke={joke} />
      <Cta
        select={select}
        setSelect={setSelect}
        onGetJoke={handleGetJoke}
        idCounter={idCounter}
      />
      <Footer />
    </div>
  );
}

function Logo({ select }) {
  return (
    <div className="logo">
      <img className="logo__img" src="/logo.png" alt="logo" />
      <h1 className="logo__heading-primary">
        {select === "pl" ? "Ale jaja!!" : "Cracking Up!!"}{" "}
      </h1>
    </div>
  );
}

function JokingText({ joke }) {
  // if (!jokes || !jokes.type) return;
  return (
    <div className="joking-text">
      <div key={joke.id} className="joke">
        <p>{joke.jokeText}</p>
      </div>
    </div>
  );
}

function Cta({ select, setSelect, onGetJoke, idCounter }) {
  return (
    <div className="cta">
      <Button onClick={onGetJoke}>
        {select === "pl" ? "Żart" : "Joke"}{" "}
        {(idCounter > 0 && idCounter <= 10 && `(${10 - idCounter})`) ||
          (idCounter > 10 && `(${0})`)}
      </Button>
      <form>
        <select
          className="cta__select"
          value={select}
          onChange={(e) => setSelect(e.target.value)}
        >
          <option value="" disabled>
            {select === "pl" ? "Wybierz język" : "Select language"}
          </option>
          {language.map((el) => (
            <option key={el.id} value={el.value}>
              {select === "pl" ? el.descriptionPl : el.descriptionEN}
            </option>
          ))}
        </select>
      </form>
    </div>
  );
}

function Footer() {
  return (
    <footer>
      <p className="copyright">
        Copyright &copy; <span>{new Date().getFullYear()}</span> by Seweryn
        Zagajny. <br />
        All rights reserved.
      </p>
    </footer>
  );
}
