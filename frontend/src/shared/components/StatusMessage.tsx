import type { ReactNode } from "react";

type StatusMessageProps = {
  tone: "info" | "error";
  children: ReactNode;
  onRetry?: () => void;
};

export function StatusMessage({ tone, children, onRetry }: StatusMessageProps) {
  return (
    <div className={`status status--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <p>{children}</p>
      {onRetry ? (
        <button type="button" className="button" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
