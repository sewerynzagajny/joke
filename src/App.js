import { useState } from "react";
import { useEffect } from "react";

const language = [
  { id: 0, value: "pl", descriptionPl: "Polski", descriptionEN: "Polish" },
  { id: 1, value: "en", descriptionPl: "Angielski", descriptionEN: "English" },
];

const limitMessages = [
  { id: 10, type: "single", joke: "Został osiągnięty dzienny limit" },
  {
    id: 11,
    type: "single",
    joke: "Niestety musisz samodzielnie wymyśleć żart",
  },
  { id: 12, type: "single", joke: "Nie klikaj. Nic to nie da. Wróć jutro" },
  { id: 13, type: "single", joke: "Serio wróc jutro! Starczy na dziś" },
  { id: 14, type: "single", joke: "Wróć jutro!" },
];

const apiURL = "https://v2.jokeapi.dev/joke/Any";

function Timeout(s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
}

async function AJAX(url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    const res = await Promise.race([fetchPro, Timeout(10)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} ${res.status}`);
    return data;
  } catch (err) {
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

  function handleGetData() {
    getDataFromAPI();
  }

  async function getDataFromAPI() {
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
      setIdCounter((prev) => prev + 1);
      setJoke({ ...data, id: idCounter });
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
      <Cta select={select} setSelect={setSelect} onGetData={handleGetData} />
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
        {joke.type === "single" && <p>{joke.joke}</p>}
        {joke.type === "twopart" && (
          <>
            <p>{joke.setup}</p>
            <p>{joke.delivery}</p>
          </>
        )}
      </div>
    </div>
  );
}

function Cta({ select, setSelect, onGetData }) {
  return (
    <div className="cta">
      <Button onClick={onGetData}>{select === "pl" ? "Żart" : "Joke"}</Button>
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
