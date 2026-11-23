"use client";

import { ImagePlus, Send, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fr } from "@/i18n/fr";
import type { Category, Member } from "@/types";

type Draft = { title: string; content: string; categoryId: string; attachment?: string };

export function PostComposer({ user, categories, onPublish }: { user: Member; categories: Category[]; onPublish: (draft: Draft) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>({ title: "", content: "", categoryId: categories[0]?.id ?? "" });
  const fileRef = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) return;
    setOpen(false);
    const submitted = draft;
    setDraft({ title: "", content: "", categoryId: categories[0]?.id ?? "" });
    await onPublish(submitted);
  }

  return (
    <Card className="post-composer">
      {!open ? (
        <button type="button" className="composer-prompt" onClick={() => setOpen(true)} aria-label={fr.feed.openEditor}>
          <Avatar member={user} />
          <span>{fr.feed.composer}</span>
          <ImagePlus size={19} aria-hidden="true" />
        </button>
      ) : (
        <form onSubmit={submit} className="composer-form">
          <div className="composer-head"><Avatar member={user} /><strong>{user.name}</strong><Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label={fr.actions.close}><X size={18} /></Button></div>
          <label><span className="sr-only">{fr.feed.composerTitle}</span><input required autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder={fr.feed.composerTitle} /></label>
          <label><span className="sr-only">{fr.feed.composerBody}</span><textarea required rows={5} value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder={fr.feed.composerBody} /></label>
          <div className="composer-footer">
            <select aria-label={fr.feed.chooseCategory} value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input ref={fileRef} className="sr-only" type="file" accept="image/*,.pdf,.doc,.docx" onChange={(event) => setDraft({ ...draft, attachment: event.target.files?.[0]?.name })} />
            <Button variant="secondary" onClick={() => fileRef.current?.click()}><ImagePlus size={16} />{draft.attachment ?? fr.actions.attach}</Button>
            <Button type="submit"><Send size={16} />{fr.actions.publish}</Button>
          </div>
        </form>
      )}
    </Card>
  );
}
