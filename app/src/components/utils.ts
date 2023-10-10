import pinyin from "pinyin";

export const LOCAL_STORAGE_KEY = 'anki_flashcards_app_data';

export interface Phrase {
  original: string;
  pinyin: string;
  extra: string;
  cloze: number;
}

const isChineseCharacter = (ch: string): boolean => {
  const code = ch?.charCodeAt(0);
  return (code >= 0x4E00 && code <= 0x9FFF) || (code >= 0x3400 && code <= 0x4DBF);
}

export const translateChineseToPinyin = (input: string): string => {
  // Split the string into segments of Chinese, non-Chinese characters, and newlines
  const segments: string[] = [];
  let currentSegment = "";
  let previousWasChinese = isChineseCharacter(input[0]);

  for (const char of input) {
    if (char === '\n') { // Always split on newline
      if (currentSegment) {
        segments.push(currentSegment);
      }
      segments.push(char); // Push newline character as its own segment
      currentSegment = "";
      continue;
    }
    
    const isChinese = isChineseCharacter(char);
    if (isChinese !== previousWasChinese) {
      segments.push(currentSegment);
      currentSegment = "";
    }
    currentSegment += char;
    previousWasChinese = isChinese;
  }

  // Add the last segment if it exists
  if (currentSegment) {
    segments.push(currentSegment);
  }

  // Convert only the Chinese segments to Pinyin
  const translatedSegments = segments.map(segment => {
    if (segment === '\n') {
      return segment; // Return newlines unchanged
    } else if (isChineseCharacter(segment[0])) {
      return pinyin(segment, { heteronym: true }).flat().join(' ') + ' ';
    }
    return segment + ' '; // Return non-Chinese segments unchanged
  });

  // Re-assemble and return the full string
  return translatedSegments.join('');
}
