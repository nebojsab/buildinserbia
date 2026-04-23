"use client";

import type { CSSProperties, ReactNode } from "react";

type ConfirmSubmitButtonProps = {
  message: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function ConfirmSubmitButton({ message, className, style, children }: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      style={style}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
