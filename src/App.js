export default function App() {
  return (
    <div className="app">
      <Logo />
      <JokingText />
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
