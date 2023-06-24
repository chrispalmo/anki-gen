import { CSSProperties, useEffect, useRef, useState } from "react";

export const EditableField: React.FC<{
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
