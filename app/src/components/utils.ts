import pinyin from "pinyin";

export const LOCAL_STORAGE_KEY = 'anki_flashcards_app_data';

export interface Phrase {
  original: string;
  pinyin: string;
  extra: string;
  cloze: boolean;
}

export const translateChineseToPinyin = (input: string) => {
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
