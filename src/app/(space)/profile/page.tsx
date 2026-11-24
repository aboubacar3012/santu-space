"use client";

import { Eye, EyeOff, Mail, Phone, Save, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { fr } from "@/i18n/fr";
import type { Member } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonMember, SkeletonSidebar } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";

type ProfileForm = Pick<Member, "firstName" | "lastName" | "email" | "phone" | "showEmail" | "showPhone">;

export default function ProfilePage() {
  const [profile, setProfile] = useState<Member>();
  const [form, setForm] = useState<ProfileForm>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    void api.getCurrentUser()
      .then((member) => {
        setProfile(member);
        setForm({
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phone: member.phone,
          showEmail: member.showEmail,
          showPhone: member.showPhone,
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <section className="profile-page"><SkeletonSidebar /><SkeletonMember /></section>;
  }

  if (error || !profile || !form) {
    return <EmptyState title={fr.state.error} />;
  }

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((current) => current ? { ...current, [key]: value } : current);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setSaveFailed(false);
    try {
      const updated = await api.updateProfile(form);
      setProfile(updated);
      setForm({
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phone: updated.phone,
        showEmail: updated.showEmail,
        showPhone: updated.showPhone,
      });
      showToast(fr.profile.saved);
    } catch {
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  }

  const publicPreview: Member = {
    ...profile,
    ...form,
    name: `${form.firstName} ${form.lastName}`.trim(),
    initials: `${form.firstName[0] ?? ""}${form.lastName[0] ?? ""}`.toUpperCase(),
  };

  return (
    <section className="profile-page">
      <div className="standard-page-heading">
        <div className="page-icon"><UserRound size={23} /></div>
        <div><p className="eyebrow">{fr.profile.account}</p><h1>{fr.profile.title}</h1><p>{fr.profile.subtitle}</p></div>
      </div>

      <div className="profile-grid">
        <div className="profile-main">
          <form onSubmit={save}>
            <Card className="profile-card linkup-card">
              <div className="profile-form-heading"><span className="profile-form-icon"><UserRound size={18} /></span><div><h2>{fr.profile.identity}</h2><p>{fr.profile.identityHint}</p></div></div>
              <div className="profile-fields two-columns">
                <label>{fr.profile.firstName}<input required autoComplete="given-name" value={form.firstName} onChange={(event) => update("firstName", event.target.value)} /></label>
                <label>{fr.profile.lastName}<input required autoComplete="family-name" value={form.lastName} onChange={(event) => update("lastName", event.target.value)} /></label>
              </div>
            </Card>

            <Card className="profile-card linkup-card">
              <div className="profile-form-heading"><span className="profile-form-icon"><Mail size={18} /></span><div><h2>{fr.profile.contact}</h2><p>{fr.profile.contactHint}</p></div></div>
              <div className="profile-fields">
                <div className="profile-contact-field">
                  <label>{fr.profile.email}<input required type="email" autoComplete="email" value={form.email ?? ""} onChange={(event) => update("email", event.target.value)} aria-describedby="email-visibility-status" /></label>
                  <label className="visibility-switch">
                    <input type="checkbox" checked={form.showEmail} onChange={(event) => update("showEmail", event.target.checked)} />
                    <span aria-hidden="true" /><strong>{fr.profile.showEmail}</strong>
                  </label>
                  <small id="email-visibility-status" className={form.showEmail ? "visibility-visible" : "visibility-hidden"}>{form.showEmail ? <Eye size={13} /> : <EyeOff size={13} />}{form.showEmail ? fr.profile.visible : fr.profile.hidden}</small>
                </div>
                <div className="profile-contact-field">
                  <label>{fr.profile.phone}<input type="tel" autoComplete="tel" value={form.phone ?? ""} onChange={(event) => update("phone", event.target.value)} aria-describedby="phone-hint phone-visibility-status" placeholder={fr.profile.phonePlaceholder} /></label>
                  <label className="visibility-switch">
                    <input type="checkbox" checked={form.showPhone} onChange={(event) => update("showPhone", event.target.checked)} />
                    <span aria-hidden="true" /><strong>{fr.profile.showPhone}</strong>
                  </label>
                  <small id="phone-hint">{fr.profile.phoneOptional}</small>
                  <small id="phone-visibility-status" className={form.showPhone ? "visibility-visible" : "visibility-hidden"}>{form.showPhone ? <Eye size={13} /> : <EyeOff size={13} />}{form.showPhone ? fr.profile.visible : fr.profile.hidden}</small>
                </div>
              </div>
            </Card>

            {saveFailed ? <p className="profile-save-error" role="alert">{fr.profile.saveFailed}</p> : null}
            <div className="profile-save-bar"><Button type="submit" disabled={saving}><Save size={16} />{saving ? fr.profile.saving : fr.profile.save}</Button></div>
          </form>
        </div>

        <aside className="profile-side">
          <Card className="profile-preview-card">
            <p className="eyebrow">{fr.profile.preview}</p>
            <Avatar member={publicPreview} size="xl" />
            <h2>{publicPreview.name || profile.name}</h2>
            <span className={`role-badge role-${profile.role}`}>{fr.members[profile.role]}</span>
            <div className="profile-preview-data">
              {form.showEmail && form.email ? <span><Mail size={15} />{form.email}</span> : null}
              {form.showPhone && form.phone ? <span><Phone size={15} />{form.phone}</span> : null}
              {!form.showEmail && !form.showPhone ? <span><EyeOff size={15} />{fr.profile.hidden}</span> : null}
            </div>
          </Card>
          <Card className="privacy-note linkup-card"><span><ShieldCheck size={20} /></span><h2>{fr.profile.privacyTitle}</h2><p>{fr.profile.privacyDescription}</p></Card>
        </aside>
      </div>
    </section>
  );
}
