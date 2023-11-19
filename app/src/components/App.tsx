import { useState } from 'react';
import { Phrase, LOCAL_STORAGE_KEY } from './utils';
import { CustomizePage } from "./CustomizePage";
import { StartPage } from "./StartPage";
import "./App.css";

const App: React.FC = () => {
  const [phrases, setPhrases] = useState<Phrase[] | null>(null);

  const savePhrasesToLocalStorage = () => {
    if (phrases) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(phrases));
    }
  };

  const loadPhrases = () => {
    // Load phrases from local storage on initial load
    const savedPhrases = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedPhrases) {
        setPhrases(JSON.parse(savedPhrases));
    }
}

  return (
    <div className="App">
      {phrases ? 
        <CustomizePage 
          phrases={phrases} 
          setPhrases={setPhrases} 
          savePhrasesToLocalStorage={savePhrasesToLocalStorage} 
        />
        : <StartPage setPhrases={setPhrases} loadPhrases={loadPhrases} />}
    </div>
  );
}
export default App;
