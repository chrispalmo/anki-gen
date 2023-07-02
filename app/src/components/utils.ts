import pinyin from "pinyin";

export const LOCAL_STORAGE_KEY = 'anki_flashcards_app_data';

export interface Phrase {
  original: string;
  pinyin: string;
  extra: string;
  cloze: boolean;
}

export const translateChineseToPinyin = (input: string) => {
  return pinyin(input, {
    heteronym: false, 
    segment: "segmentit",
    group: true
  }).flat().join(' ');
};
