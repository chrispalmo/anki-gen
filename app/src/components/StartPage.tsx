import React, { useState, ChangeEvent, MouseEvent } from "react";
import { Phrase, translateChineseToPinyin } from "./utils";

export const StartPage: React.FC<{ setPhrases: (phrases: Phrase[]) => void }> = ({ setPhrases }) => {
  const [input, setInput] = useState<string>("");

  const handleSubmit = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const phrases = input.split("\n\n").map(phrase => {
      const pinyinText = translateChineseToPinyin(phrase);
      return {
        original: phrase,
        pinyin: pinyinText,
        cloze: false,
        extra: '',
      };
    });
    setPhrases(phrases);
  };
  
  return (
    <div style={{ padding: '1em', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 2em)' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>Enter Chinese phrases</h1>
        <p>Separate each phrase by two new lines (i.e press return twice)</p>
      </div>
      <textarea 
        value={input} 
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
        style={{ flexGrow: 1, marginBottom: '1em', width: '100%', overflow: 'auto' }} 
      />
      <button onClick={handleSubmit} style={{ alignSelf: 'center' }}>Continue</button>
    </div>
  );
}
