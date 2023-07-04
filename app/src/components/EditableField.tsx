import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";

const sharedStyles: CSSProperties = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '1rem',
  width: '100%',
  height: '100%',
  padding: '0.1rem',
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


export const EditableField: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // additional function for creating cloze deletions
  const createClozeDeletion = useCallback(
    (event: KeyboardEvent) => {
      if (event.altKey && event.shiftKey && event.code === 'KeyC') {
        event.preventDefault();
        navigator.clipboard.readText().then(clipText => {
          const textArea = textareaRef.current;
          if (!textArea) return;
          const start = textArea.selectionStart;
          const end = textArea.selectionEnd;
          const selectedText = textArea.value.slice(start, end);
          const clozeText = `{{c1::${selectedText}::${clipText}}}`;
          const newValue =
            textArea.value.slice(0, start) +
            clozeText +
            textArea.value.slice(end);
          onChange(newValue);
        });
      }
    },
    [onChange]
  );

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
      document.addEventListener('keydown', createClozeDeletion);
    } else {
      document.removeEventListener('keydown', createClozeDeletion);
    }
    return () => document.removeEventListener('keydown', createClozeDeletion);
  }, [isEditing, createClozeDeletion]);

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
  }, [isEditing, value]);

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
      onMouseEnter={e => (e.currentTarget.style.background = '#383838')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      {value.split('\n').length > 1 ? value : (
        <>
          {value}
          <br/>
          {' '}
        </>
      )}
    </div>
  );
};
