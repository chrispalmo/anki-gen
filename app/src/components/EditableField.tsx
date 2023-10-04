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

const defaultDivStyles: CSSProperties = {
  ...sharedStyles,
  minHeight: '1em',
  whiteSpace: 'pre-wrap',
  cursor: 'pointer'
}

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
      setNormalStyle();
    }

    function autoResize() {
      textareaRef.current!.style.height = 'auto';
      textareaRef.current!.style.height = textareaRef.current!.scrollHeight + 'px';
    }
  }, [isEditing, value]);

  const [extraStyles, setExtraStyles] = useState<CSSProperties>({background: 'none'});

  const setHoveredStyle = () => setExtraStyles({background: '#383838'})
  const setNormalStyle = () => setExtraStyles({ background: 'none' })

  // reset styles when tab key is pressed
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Tab') {
        setNormalStyle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  })

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
      onFocus={() => {
        setIsEditing(true);
        setHoveredStyle();
      }}
      onBlur={setNormalStyle}
      style={{...defaultDivStyles, ...extraStyles}}
      onMouseEnter={setHoveredStyle}
      onMouseLeave={setNormalStyle}
      tabIndex={0}
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
