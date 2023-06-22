import React, { useState, ChangeEvent, MouseEvent, useEffect, useRef, CSSProperties } from "react";
import Papa from 'papaparse';
import pinyin from "pinyin";

interface Phrase {
  original: string;
  pinyin: string;
  cloze: boolean;
}

const StartPage: React.FC<{ setPhrases: (phrases: Phrase[]) => void }> = ({ setPhrases }) => {
  const [input, setInput] = useState<string>("");

  const handleSubmit = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  
    // A function to determine if a character is a Chinese character
    const isChinese = (char: string) => /\p{Script=Han}/u.test(char);
  
    const phrases = input.split("\n\n").map(phrase => {
      // Segment the input into Chinese phrases and non-Chinese words
      let segments = phrase.split(/(\P{Script=Han}+)/gu);
  
      // Apply pinyin to the Chinese phrases
      segments = segments.map(segment =>
        isChinese(segment[0])
          ? pinyin(segment, { heteronym: true, segment: true }).flat().join(' ')
          : segment
      );
  
      // Reconstruct the input
      const reconstructed = segments.join('');
  
      return {
        original: phrase,
        pinyin: reconstructed,
        cloze: false
      };
    });
  
    setPhrases(phrases);
  }
  

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

const EditableField: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sharedStyles: CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '1rem',
    width: '100%',
    padding: '0.1rem',
    margin: '1rem 2rem 1rem 2rem',
    border: '2px solid white',
    textAlign: 'left',
  };

  const textareaStyles: CSSProperties = {
    ...sharedStyles,
    paddingTop: '0.08rem',
    paddingLeft: '0.09rem',
    resize: 'none',
    overflow: 'hidden',
  };

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
      const tx = textareaRef.current;
      tx?.addEventListener('input', autoResize, false);
      autoResize();
    }

    function autoResize() {
      textareaRef.current!.style.height = 'auto';
      textareaRef.current!.style.height = textareaRef.current!.scrollHeight + 'px';
    }
  }, [isEditing]);

  const lines = value.split('\n');
  const isLastLine = (i: number) => i === lines.length - 1;
  const isSingleLineValue = (i: number) => lines.length === 1;
  const divContent = lines.map((text, index) => (
    <React.Fragment key={index}>
      {text}
      {isLastLine(index) && !isSingleLineValue ? <br /> : null}
    </React.Fragment>
  ));

  return isEditing ? (
    <textarea
      ref={textareaRef}
      style={textareaStyles}
      value={value}
      onBlur={() => setIsEditing(false)}
      onChange={e => onChange(e.target.value)}
    />
  ) : (
    <div
      onClick={() => setIsEditing(true)}
      style={{ ...sharedStyles, minHeight: '1em', whiteSpace: 'pre-wrap' }}
    >
      {divContent}
    </div>
  );
};

const CustomizePage: React.FC<{ phrases: Phrase[]; setPhrases: (phrases: Phrase[]) => void }> = ({ phrases, setPhrases }) => {
  const handleTextChange = (index: number, field: 'original' | 'pinyin', value: string) => {
    const newPhrases = [...phrases];
    newPhrases[index][field] = value;
  
    if (field === 'original') {
      // Check for cloze deletion markers in the string (with optional hint)
      newPhrases[index].cloze = /\{\{c\d+::[^}]+(::[^}]+)?\}\}/.test(value);
    }
  
    setPhrases(newPhrases);
  }

  const generateAndDownloadCSV = (phrases: Phrase[], cardType: 'basic' | 'cloze') => {
    const csv = Papa.unparse(phrases.map(phrase => [
      phrase.original,
      phrase.pinyin,
    ]));
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${new Date().toISOString().slice(0, 10)}--new-flashcards.anki${cardType}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleExport = () => {
    const clozePhrases = phrases.filter(phrase => phrase.cloze); 
    generateAndDownloadCSV(clozePhrases, 'cloze');

    const basicPhrases = phrases.filter(phrase => !phrase.cloze); 
    generateAndDownloadCSV(basicPhrases, 'basic');
  }

  return (
    <div style={{ padding: '1em', height: 'calc(100vh - 2em)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ overflow: 'auto', flexGrow: 1 }}>
        <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse', borderSpacing: '0' }}>
          <thead>
            <tr>
              <th>Front (Chinese)</th>
              <th>Back (Pinyin)</th>
              <th>Cloze?</th>
            </tr>
          </thead>
          <tbody>
            {phrases.map((phrase, index) => (
              <tr key={index}>
                <td style={{ width: '40%', verticalAlign: 'top', textAlign: 'left' }}>
                  <EditableField value={phrase.original} onChange={value => handleTextChange(index, 'original', value)} />
                </td>
                <td style={{ width: '40%', verticalAlign: 'top', textAlign: 'left'  }}>
                  <EditableField value={phrase.pinyin} onChange={value => handleTextChange(index, 'pinyin', value)} />
                </td>
                <td style={{ width: '20%' , verticalAlign: 'top', textAlign: 'center' }}>
                  <input disabled type="checkbox" style={{ margin: '1.5rem 2rem 2rem 1rem' }} checked={phrase.cloze} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={handleExport} style={{ marginTop: '1em' }}>Export</button>
    </div>
  );
}

const App: React.FC = () => {
  const [phrases, setPhrases] = useState<Phrase[] | null>(null);

  return (
    <div className="App">
      {phrases ? <CustomizePage phrases={phrases} setPhrases={setPhrases} /> : <StartPage setPhrases={setPhrases} />}
    </div>
  );
}

export default App;
