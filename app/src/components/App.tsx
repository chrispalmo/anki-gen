import { useState } from "react";
import { Phrase } from "./utils";
import { CustomizePage } from "./CustomizePage";
import { StartPage } from "./StartPage";
import "./App.css";

const App: React.FC = () => {
  const [phrases, setPhrases] = useState<Phrase[] | null>(null);

  return (
    <div className="App">
      {phrases ? 
        <CustomizePage phrases={phrases} setPhrases={setPhrases} />
        : <StartPage setPhrases={setPhrases} />}
    </div>
  );
}

export default App;
