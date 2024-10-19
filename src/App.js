import { useState } from "react";

const language = [
  { id: 0, value: "pl", descriptionPl: "Polski", descriptionEN: "Polish" },
  { id: 1, value: "en", descriptionPl: "Angielski", descriptionEN: "English" },
];

function Button({ onClick, children }) {
  return (
    <button className="btn" onClick={onClick}>
      <span className="btn__text">{children}</span>
    </button>
  );
}

export default function App() {
  const [select, setStelect] = useState("pl");

  return (
    <div className="app">
      <Logo select={select} />
      <JokingText />
      <Cta select={select} setStelect={setStelect} />
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

function JokingText() {
  return (
    <div className="joking-text">
      <p className="setup">Why do cows wear bells?</p>
      <p className="delivery">Because their horns don't work!</p>
      <p className="joke">
        I have a fish that can breakdance! Only for 20 seconds though, and only
        once.
      </p>
    </div>
  );
}

function Cta({ select, setStelect }) {
  return (
    <div className="cta">
      <Button>{select === "pl" ? "Żart" : "Joke"}</Button>
      <form>
        <select
          className="cta__select"
          value={select}
          onChange={(e) => setStelect(e.target.value)}
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
