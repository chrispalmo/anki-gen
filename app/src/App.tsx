import React, { useState, ChangeEvent, MouseEvent, useEffect, useRef, CSSProperties } from "react";
import Papa from 'papaparse';
import pinyin from "pinyin";

interface Phrase {
  original: string;
  pinyin: string;
  extra: string;
  cloze: boolean;
}

const translateChineseToPinyin = (input: string) => {
  const segments = input.split(/(\P{Script=Han}+)/gu);

  const translatedSegments = segments.map(segment => {
    if (/\p{Script=Han}/u.test(segment)) {
      return pinyin(segment, { heteronym: true, segment: true }).flat().join(' ');
    } else {
      return segment;
    }
  });

  // Add spaces around non-Chinese segments
  const spacedSegments = translatedSegments.map((segment, i, array) => {
    if (!/\p{Script=Han}/u.test(segment)) {
      const spaceBefore = i > 0 ? ' ' : '';
      const spaceAfter = i < array.length - 1 ? ' ' : '';
      return spaceBefore + segment + spaceAfter;
    } else {
      return segment;
    }
  });

  return spacedSegments.join('');
};

const StartPage: React.FC<{ setPhrases: (phrases: Phrase[]) => void }> = ({ setPhrases }) => {
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
    height: '100%',
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
    width: '100%',
    height: '100%',
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
      style={{ ...sharedStyles, minHeight: '1em', whiteSpace: 'pre-wrap', cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.style.border = '1px solid silver')}
      onMouseLeave={e => (e.currentTarget.style.border = '1px solid white')}
    >
      {divContent}
    </div>
  );
};

const CustomizePage: React.FC<{ phrases: Phrase[]; setPhrases: (phrases: Phrase[]) => void }> = ({ phrases, setPhrases }) => {
  const handleTextChange = (index: number, field: 'original' | 'pinyin' | 'extra', value: string) => {
    const newPhrases = [...phrases];
    newPhrases[index][field] = value;
  
    if (field === 'original') {
      newPhrases[index].cloze = /\{\{c\d+::[^}]+(::[^}]+)?\}\}/.test(value);
    }
  
    setPhrases(newPhrases);
  }
  
  const generateAndDownloadCSV = (phrases: Phrase[], cardType: 'basic' | 'cloze') => {
    const csv = Papa.unparse(phrases.map(phrase => {
      const back = `${phrase.pinyin}${phrase.extra ? '\n\n' : ''}${phrase.extra}` // append extra with two new lines if it's not empty
      return [
        phrase.original,
        back,
      ];
    }));
    
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
              <th>Back (Extra)</th>
              <th>Cloze?</th>
            </tr>
          </thead>
          <tbody>
            {phrases.map((phrase, index) => (
              <tr key={index}>
                <td style={{ width: '28%', verticalAlign: 'top', textAlign: 'left' }}>
                  <EditableField value={phrase.original} onChange={value => handleTextChange(index, 'original', value)} />
                </td>
                <td style={{ width: '28%', verticalAlign: 'top', textAlign: 'left'  }}>
                  <EditableField value={phrase.pinyin} onChange={value => handleTextChange(index, 'pinyin', value)} />
                </td>
                <td style={{ width: '28%', verticalAlign: 'top', textAlign: 'left'  }}>
                  <EditableField value={phrase.extra} onChange={value => handleTextChange(index, 'extra', value)} />
                </td>
                <td style={{ width: '16%' , verticalAlign: 'top', textAlign: 'center' }}>
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
