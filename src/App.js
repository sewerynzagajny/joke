import { useState } from "react";

const language = [
  { id: 0, value: "pl", descriptionPl: "Polski", descriptionEN: "Polish" },
  { id: 1, value: "en", descriptionPl: "Angielski", descriptionEN: "English" },
];

function Button({ onClick, children }) {
  return (
    <button className="btn" onClick={onClick}>
      {children}
    </button>
  );
}

export default function App() {
  return (
    <div className="app">
      <Logo />
      <JokingText />
      <Cta />
      <Footer />
    </div>
  );
}

function Logo() {
  return (
    <div className="logo">
      <img className="logo__img" src="/logo.png" alt="logo" />
      <h1 className="logo__heading-primary"> Ale jaja!!</h1>
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

function Cta() {
  const [select, setStelect] = useState("pl");
  return (
    <div className="cta">
      <Button>{select === "pl" ? "Żart" : "Joke"}</Button>
      <select
        className="cta__select"
        value={select}
        onChange={(e) => setStelect(e.target.value)}
      >
        <option value="" disabled selected>
          {select === "pl" ? "Wybierz język" : "Select language"}
        </option>
        {language.map((el) => (
          <option key={el.id} value={el.value}>
            {select === "pl" ? el.descriptionPl : el.descriptionEN}
          </option>
        ))}
      </select>
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
