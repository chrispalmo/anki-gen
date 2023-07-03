import Papa from "papaparse";
import { EditableField } from "./EditableField";
import { Phrase, translateChineseToPinyin } from "./utils";

export const CustomizePage: React.FC<{ phrases: Phrase[]; setPhrases: (phrases: Phrase[]) => void }> = ({ phrases, setPhrases }) => {
  const handleTextChange = (index: number, field: 'original' | 'pinyin' | 'extra', value: string) => {
    const newPhrases = [...phrases];
    newPhrases[index][field] = value;
    if (field === 'original') {
      const matches = value.match(/\{\{c\d+::[^}]+(::[^}]+)?\}\}/g) || [];
      newPhrases[index].cloze = matches.length;
    }
    setPhrases(newPhrases);
  }
  
  const generateAndDownloadCSV = (phrases: Phrase[], cardType: 'basic' | 'cloze') => {
    const csv = Papa.unparse(phrases.map(phrase => {
      const back = `${phrase.pinyin}${phrase.extra ? '\n\n' : ''}${phrase.extra}` // append extra with two new lines if it's not empty
      return [
        phrase.original || '""',
        back || '""',
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
    if (clozePhrases.length > 0) {
      generateAndDownloadCSV(clozePhrases, 'cloze');
    }
    
    const basicPhrases = phrases.filter(phrase => !phrase.cloze); 
    if (basicPhrases.length > 0) {
      generateAndDownloadCSV(basicPhrases, 'basic');
    }
  }
  

  const handleDelete = (index: number) => {
    const newPhrases = [...phrases];
    newPhrases.splice(index, 1);
    setPhrases(newPhrases);
  }

  const handleAdd = () => {
    const newPhrases = [...phrases, { original: '', pinyin: '', cloze: 0, extra: '' }];
    setPhrases(newPhrases);
  }

  const handleRefresh = (index: number) => {
    const newPhrases = [...phrases];
    newPhrases[index].pinyin = translateChineseToPinyin(newPhrases[index].original);
    setPhrases(newPhrases);
  }

  const clozeCardCount = phrases.filter(phrase => phrase.cloze).length;
  const basicCardCount = phrases.filter(phrase => !phrase.cloze).length;

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
              <td style={{ width: '30%', verticalAlign: 'top', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <EditableField value={phrase.original} onChange={value => handleTextChange(index, 'original', value)} />
                </div>
              </td>
              <td style={{ width: '30%', verticalAlign: 'top', textAlign: 'left'  }}>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <EditableField value={phrase.pinyin} onChange={value => handleTextChange(index, 'pinyin', value)} />
                  <div onClick={() => handleRefresh(index)} style={{ background: 'none', border: 'none', marginLeft: '1rem', cursor: 'pointer' }}>🔄</div>
                </div>
              </td>
              <td style={{ width: '30%', verticalAlign: 'top', textAlign: 'left'  }}>
                <EditableField value={phrase.extra} onChange={value => handleTextChange(index, 'extra', value)} />
              </td>
              <td style={{ width: '10%' , verticalAlign: 'top', textAlign: 'center' }}>
                {'✅'.repeat(phrase.cloze)}
              </td>
              <td style={{ width: '5%' , verticalAlign: 'top', textAlign: 'center' }}>
                <div onClick={() => handleDelete(index)} style={{ border: 'none', background: 'none', color: 'gray', cursor: 'pointer'}}>X</div>
              </td>
            </tr>
          ))}
          <tr>
            <div style={{display: 'flex'}}>
              <button onClick={handleAdd}>+</button>
            </div>
          </tr>
        </tbody>
      </table>
      </div>
      <button onClick={handleExport}>Export ({clozeCardCount} cloze + {basicCardCount} basic cards)</button>
    </div>
  );
}
