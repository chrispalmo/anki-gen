// hello?
import React, { useState, ChangeEvent, MouseEvent, useEffect, useRef, CSSProperties } from "react";
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

    const phrases = input.split("\n\n").map(phrase => ({
      original: phrase,
      pinyin: pinyin(phrase, { heteronym: true, segment: true }).flat().join(' '),
      cloze: false
    }));

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
    padding: '0.125rem',
    border: '1px solid #ccc',
    textAlign: 'left',
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
  const divValue = lines.map((text, index) => (
    <React.Fragment key={index}>
      {text}
      {(isLastLine(index) && !isSingleLineValue) ? <br /> : null}
    </React.Fragment>
  ));

  return isEditing ? (
    <textarea
      ref={textareaRef}
      style={{ ...sharedStyles, resize: 'none', overflow: 'hidden' }}
      value={value}
      onBlur={() => setIsEditing(false)}
      onChange={e => onChange(e.target.value)}
    />
  ) : (
    <div
      onClick={() => setIsEditing(true)}
      style={{ ...sharedStyles, minHeight: '1em', whiteSpace: 'pre-wrap' }}
    >
      {divValue}
    </div>
  );
};

const CustomizePage: React.FC<{ phrases: Phrase[]; setPhrases: (phrases: Phrase[]) => void }> = ({ phrases, setPhrases }) => {

  const handleTextChange = (index: number, field: 'original' | 'pinyin', value: string) => {
    const newPhrases = [...phrases];
    newPhrases[index][field] = value;
    setPhrases(newPhrases);
  }

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newPhrases = [...phrases];
    newPhrases[index].cloze = checked;
    setPhrases(newPhrases);
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
                <td style={{ width: '45%' }}>
                  <EditableField value={phrase.original} onChange={value => handleTextChange(index, 'original', value)} />
                </td>
                <td style={{ width: '45%' }}>
                  <EditableField value={phrase.pinyin} onChange={value => handleTextChange(index, 'pinyin', value)} />
                </td>
                <td style={{ width: '10%' }}>
                  <input type="checkbox" style={{ marginLeft: 'auto', marginRight: 'auto' }} checked={phrase.cloze} onChange={e => handleCheckboxChange(index, e.target.checked)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button style={{ marginTop: '1em' }}>Export</button>
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
