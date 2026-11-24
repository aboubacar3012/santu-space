"use client";

import { Flag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { fr } from "@/i18n/fr";

export function ReportDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!open) return;
    textareaRef.current?.focus();
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <div className="dialog-heading">
          <span className="dialog-icon">
            <Flag size={20} />
          </span>
          <button type="button" onClick={onClose} aria-label={fr.actions.close}>
            <X size={19} />
          </button>
        </div>
        <h2 id="report-title">{fr.report.title}</h2>
        <p>{fr.report.description}</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (reason.trim()) {
              onSubmit(reason);
              setReason("");
              onClose();
            }
          }}
        >
          <label>
            {fr.report.reason}
            <textarea
              ref={textareaRef}
              required
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={fr.report.placeholder}
            />
          </label>
          <div className="dialog-actions">
            <Button variant="secondary" onClick={onClose}>
              {fr.actions.cancel}
            </Button>
            <Button type="submit">{fr.report.submit}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
