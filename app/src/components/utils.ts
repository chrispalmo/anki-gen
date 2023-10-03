import pinyin from "pinyin";

export const LOCAL_STORAGE_KEY = 'anki_flashcards_app_data';

export interface Phrase {
  original: string;
  pinyin: string;
  extra: string;
  cloze: number;
}

export const translateChineseToPinyin = (input: string) => {
  const lines = input.split(/\r\n|\r|\n/);
  let output: string[] = []
  lines.forEach((line) => {
    output.push(
      pinyin(line, {
        heteronym: false, 
        segment: "segmentit",
        group: true
      }).flat().join(' ')
    )
  })
  return output.join('\n');
};
