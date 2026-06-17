import React, { useState, useEffect, useRef } from "react";

interface EditableTextProps {
  value: string;
  onSave: (val: string) => void;
  as?: React.ElementType;
  className?: string;
  multiline?: boolean;
}

export function EditableText({
  value,
  onSave,
  as: Tag = "span",
  className = "",
  multiline = false,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (!multiline && inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing, multiline]);

  const handleBlur = () => {
    setIsEditing(false);
    if (text.trim() !== value.trim()) {
      onSave(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<any>) => {
    if (e.key === "Enter" && !multiline) {
      setIsEditing(false);
      if (text.trim() !== value.trim()) {
        onSave(text);
      }
    } else if (e.key === "Escape") {
      setText(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    const baseStyle = "bg-neutral-800/90 text-white border border-cyan-500/50 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all w-full";

    return multiline ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${baseStyle} ${className} resize-none min-h-[60px]`}
        id="editable-text-area"
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${baseStyle} ${className}`}
        id="editable-text-input"
      />
    );
  }

  return (
    <Tag
      className={`${className} cursor-pointer hover:bg-neutral-800/40 hover:outline-dashed hover:outline-1 hover:outline-cyan-500/40 rounded px-1 -mx-1 group relative transition-all duration-150 inline-block`}
      onClick={() => setIsEditing(true)}
      title="Нажмите для редактирования"
      id="editable-text-container"
    >
      {value || (
        <span className="text-zinc-500 italic">Нажмите для редактирования...</span>
      )}
      <span className="absolute -right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 text-xs">
        ✏️
      </span>
    </Tag>
  );
}
