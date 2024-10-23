import { useState } from "react";
import { useEffect } from "react";
import { useCallback } from "react";

const language = [
  { id: 0, value: "pl", descriptionPl: "Polski", descriptionEN: "Polish" },
  { id: 1, value: "en", descriptionPl: "Angielski", descriptionEN: "English" },
];

const limitMessages = [
  {
    id: 10,
    jokeTextEn: "Daily limit has been reached. Try tomorrow 😉",
    jokeTextPl: "Został osiągnięty dzienny limit. Spróbuj jutro 😉",
  },
  {
    id: 11,
    jokeTextEn: "Unfortunately, you have to come up with the joke yourself 😅",
    jokeTextPl: "Niestety, musisz samodzielnie wymyślić żart 😅",
  },
  {
    id: 12,
    jokeTextEn: "Don't click. It won't do anything. Come back tomorrow 😂",
    jokeTextPl: "Nie klikaj. Nic to nie da. Wróć jutro 😂",
  },
  {
    id: 13,
    jokeTextEn: "Seriously, come back tomorrow. Enough for today 😎",
    jokeTextPl: "Serio wróc jutro. Starczy na dziś 😎",
  },
  {
    id: 14,
    jokeTextEn: "Come back tomorrow 🙂",
    jokeTextPl: "Wróć jutro 🙂",
  },
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

function Button({ onClick, children, disabled }) {
  return (
    <button className="btn" onClick={onClick} disabled={disabled}>
      <span className="btn__text">{children}</span>
    </button>
  );
}

export default function App() {
  const [select, setSelect] = useState(() => {
    const savedSelect = localStorage.getItem("select");
    return savedSelect ? savedSelect : "pl";
  });

  const [joke, setJoke] = useState(() => {
    const savedJoke = localStorage.getItem("joke");
    return savedJoke
      ? JSON.parse(savedJoke)
      : { jokeTextEn: "", jokeTextPl: "", id: 0 };
  });

  const [idCounter, setIdCounter] = useState(() => {
    const savedCounter = localStorage.getItem("idCounter");
    return savedCounter ? parseInt(savedCounter, 10) : 0;
  });

  const [translatedJokes, setTranslatedJokes] = useState(() => {
    const savedTranslations = localStorage.getItem("translatedJokes");
    return savedTranslations ? JSON.parse(savedTranslations) : {};
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("select", select);
  }, [select]);

  useEffect(() => {
    if (joke && joke.jokeTextEn) {
      localStorage.setItem("joke", JSON.stringify(joke));
      localStorage.setItem("idCounter", idCounter);
      localStorage.setItem("translatedJokes", JSON.stringify(translatedJokes));
    }
  }, [joke, idCounter, translatedJokes]);

  function checkDate() {
    let savedDateTomorrow = localStorage.getItem("dateTomorrow");

    if (!savedDateTomorrow) {
      let today = new Date();
      let tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      localStorage.setItem("dateTomorrow", tomorrow.toISOString());
    } else {
      let presentDate = new Date();
      let dateTomorrow = new Date(savedDateTomorrow);

      if (
        presentDate.getDate() === dateTomorrow.getDate() &&
        presentDate.getMonth() === dateTomorrow.getMonth() &&
        presentDate.getFullYear() === dateTomorrow.getFullYear()
      ) {
        setIdCounter(0);
        setJoke({ jokeTextEn: "", jokeTextPl: "", id: 0 });
        localStorage.removeItem("joke");
        localStorage.removeItem("idCounter");
        localStorage.removeItem("dateTomorrow");
      }
    }
  }

  useEffect(() => {
    checkDate();
  }, []);

  function handleGetJoke() {
    getJokeFromAPI();
    // getTranslationFromAPI();
  }

  function isTranslationExpired(savedDate) {
    const currentDate = new Date();
    const translationDate = new Date(savedDate);

    const diffInDays = (currentDate - translationDate) / (1000 * 60 * 60 * 24);
    return diffInDays > 30;
  }

  async function getJokeFromAPI() {
    const apiURL = "https://v2.jokeapi.dev/joke/Any";
    try {
      setLoading(true);
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
      const jokeEn = { jokeTextEn: jokeText, jokeTextPl: "", id: idCounter };
      setJoke(jokeEn);

      localStorage.setItem("joke", JSON.stringify(jokeEn));
      localStorage.setItem("idCounter", idCounter + 1);

      // await getTranslationFromAPI(jokeText);
    } catch (err) {
      console.error(`${err} ❌❌❌`);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  const getTranslationFromAPI = useCallback(
    async (jokeText) => {
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
        setLoading(true);
        const data = await AJAX(apiURL, payload, apiName, apiKey);
        console.log("Translation response:", data);
        const translateText = data.translations[0].text;
        const currentDate = new Date().toISOString();

        const newTranslatedJokes = {
          ...translatedJokes,
          [jokeText]: { text: translateText, date: currentDate },
        };

        setTranslatedJokes(newTranslatedJokes);

        setJoke((prevJoke) => ({
          ...prevJoke,
          jokeTextPl: translateText,
        }));

        localStorage.setItem(
          "translatedJokes",
          JSON.stringify(newTranslatedJokes)
        );
      } catch (err) {
        console.error(`${err} ❌❌❌`);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [translatedJokes]
  );

  useEffect(() => {
    if (select === "pl" && joke.jokeTextEn && !joke.jokeTextPl) {
      if (translatedJokes[joke.jokeTextEn]) {
        setJoke((prevJoke) => ({
          ...prevJoke,
          jokeTextPl: translatedJokes[joke.jokeTextEn],
        }));
      } else {
        getTranslationFromAPI(joke.jokeTextEn);
      }
    }
  }, [
    select,
    joke.jokeTextEn,
    joke.jokeTextPl,
    translatedJokes,
    getTranslationFromAPI,
  ]);

  useEffect(() => {
    const savedTranslation = localStorage.getItem("translatedJokes");

    if (savedTranslation) {
      const parsedTranslations = JSON.parse(savedTranslation);
      const filteredTranslations = {};

      for (const joke in parsedTranslations) {
        if (!isTranslationExpired(parsedTranslations[joke].date)) {
          filteredTranslations[joke] = parsedTranslations[joke];
        }
      }

      setTranslatedJokes(filteredTranslations);

      localStorage.setItem(
        "translatedJokes",
        JSON.stringify(filteredTranslations)
      );
    }
  }, []);

  return (
    <div className="app">
      <Logo select={select} />
      <JokingText joke={joke} select={select} loading={loading} />
      <Cta
        select={select}
        setSelect={setSelect}
        onGetJoke={handleGetJoke}
        idCounter={idCounter}
        loading={loading}
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

function JokingText({ joke, select, loading }) {
  return (
    <div className="joking-text">
      <div key={joke.id} className="joke">
        {loading ? (
          <Spinner />
        ) : (
          <p className="joking-text__text">
            {select === "pl" ? joke.jokeTextPl : joke.jokeTextEn}
          </p>
        )}
      </div>
    </div>
  );
}

function Cta({ select, setSelect, onGetJoke, idCounter, loading }) {
  return (
    <div className="cta">
      <Button onClick={onGetJoke} disabled={loading}>
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

function Spinner() {
  return (
    <div className="spinner">
      <svg width="24" height="24">
        <use href="/icons.svg#icon-loader" />
      </svg>
    </div>
  );
}
