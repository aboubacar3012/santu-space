"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, BarChart3, Check, FolderKanban, ImagePlus, LayoutDashboard, ListTree, Plus, Save, Settings2, ShieldAlert, Trash2, Users } from "lucide-react";
import { api } from "@/lib/api";
import { community as initialCommunity } from "@/mocks/community";
import { currentUser } from "@/mocks/members";
import { fr } from "@/i18n/fr";
import type { Category, Report } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/Toast";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonSidebar } from "@/components/Skeleton";

export default function SettingsPage() {
  const [name, setName] = useState(initialCommunity.name);
  const [description, setDescription] = useState(initialCommunity.description);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [banner, setBanner] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    void Promise.all([api.getCategories(), api.getReports()]).then(([items, reportItems]) => {
      setCategories(items);
      setReports(reportItems);
    }).finally(() => setLoading(false));
  }, []);

  if (currentUser.role !== "admin") return <EmptyState title={fr.settings.adminOnly} />;

  function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    window.setTimeout(() => { setSaving(false); showToast(fr.settings.saved); }, 500);
  }

  async function addCategory() {
    if (!categoryName.trim()) return;
    const next = [...categories, { id: `category-${Date.now()}`, name: categoryName.trim(), color: "green", order: categories.length }];
    setCategories(next);
    setCategoryName("");
    await api.saveCategories(next);
    showToast(fr.settings.categoryAdded);
  }

  async function removeCategory(id: string) {
    const next = categories.filter((category) => category.id !== id).map((category, order) => ({ ...category, order }));
    setCategories(next);
    await api.saveCategories(next);
    showToast(fr.settings.categoryDeleted);
  }

  function moveCategory(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    void api.saveCategories(next.map((category, order) => ({ ...category, order }))).then(setCategories);
  }

  function renameCategory(id: string, name: string) {
    const next = categories.map((category) => category.id === id ? { ...category, name } : category);
    setCategories(next);
  }

  async function resolveReport(id: string) {
    setReports(await api.resolveReport(id));
    showToast(fr.settings.reportResolved);
  }

  return (
    <section className="settings-page">
      <div className="standard-page-heading"><div className="page-icon"><ShieldAlert size={23} /></div><div><p className="eyebrow">{fr.brand}</p><h1>{fr.settings.title}</h1><p>{fr.settings.subtitle}</p></div></div>
      {loading ? <SkeletonSidebar /> : <div className="admin-dashboard">
        <aside className="admin-nav card">
          <div className="admin-nav-brand"><span><Settings2 size={18} /></span><div><strong>{fr.community.settings}</strong><small>{fr.settings.adminArea}</small></div></div>
          <nav aria-label={fr.settings.navigation}>
            <a href="#admin-overview" className="active"><LayoutDashboard size={17} />{fr.settings.dashboard}</a>
            <a href="#admin-general"><Settings2 size={17} />{fr.settings.general}</a>
            <a href="#admin-categories"><ListTree size={17} />{fr.settings.categories}</a>
            <a href="#admin-reports"><ShieldAlert size={17} />{fr.settings.reports}<span>{reports.filter((report) => report.status === "pending").length}</span></a>
          </nav>
          <div className="admin-nav-account"><strong>{currentUser.name}</strong><small>{fr.members.admin}</small></div>
        </aside>
        <div className="settings-main admin-main">
          <section id="admin-overview" className="admin-overview">
            <Card><span className="admin-stat-icon"><Users size={19} /></span><div><strong>{initialCommunity.memberCount.toLocaleString("fr-FR")}</strong><small>{fr.settings.memberCount}</small></div></Card>
            <Card><span className="admin-stat-icon secondary"><FolderKanban size={19} /></span><div><strong>{categories.length}</strong><small>{fr.settings.categoryCount}</small></div></Card>
            <Card><span className="admin-stat-icon warning"><ShieldAlert size={19} /></span><div><strong>{reports.filter((report) => report.status === "pending").length}</strong><small>{fr.settings.pendingReports}</small></div></Card>
          </section>
          <Card id="admin-general" className="settings-card linkup-card">
            <div className="settings-card-heading"><span><Settings2 size={18} /></span><div><h2>{fr.settings.general}</h2><p>{fr.settings.subtitle}</p></div></div>
            <form onSubmit={save} className="settings-form">
              <label>{fr.settings.name}<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
              <label>{fr.settings.description}<textarea required rows={5} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
              <div><span className="field-label">{fr.settings.banner}</span><div className="banner-uploader" style={banner ? { backgroundImage: `linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)), url(${banner})` } : undefined}><span>{initialCommunity.bannerLabel}</span><input ref={fileRef} className="sr-only" type="file" accept="image/jpeg,image/png" onChange={(event) => { const file = event.target.files?.[0]; if (file) setBanner(URL.createObjectURL(file)); }} /><Button variant="secondary" onClick={() => fileRef.current?.click()}><ImagePlus size={16} />{fr.settings.chooseBanner}</Button></div><small>{fr.settings.bannerHint}</small></div>
              <Button type="submit" disabled={saving}><Save size={16} />{saving ? fr.post.sending : fr.actions.save}</Button>
            </form>
          </Card>
          <Card id="admin-categories" className="settings-card linkup-card">
            <div className="settings-card-heading"><span><ListTree size={18} /></span><div><h2>{fr.settings.categories}</h2><p>{fr.settings.manageContent}</p></div></div>
            <div className="category-manager">
              {categories.map((category, index) => <div key={category.id} className="category-manager-row"><i className={`category-dot category-${category.color}`} /><input value={category.name} onChange={(event) => renameCategory(category.id, event.target.value)} onBlur={() => void api.saveCategories(categories)} /><button type="button" disabled={index === 0} onClick={() => moveCategory(index, -1)} aria-label={fr.common.moveUp}><ArrowUp size={16} /></button><button type="button" disabled={index === categories.length - 1} onClick={() => moveCategory(index, 1)} aria-label={fr.common.moveDown}><ArrowDown size={16} /></button><button type="button" onClick={() => void removeCategory(category.id)} aria-label={fr.common.remove}><Trash2 size={16} /></button></div>)}
            </div>
            <div className="add-category"><input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder={fr.settings.categoryName} /><Button variant="secondary" onClick={() => void addCategory()}><Plus size={16} />{fr.actions.add}</Button></div>
          </Card>
          <Card id="admin-reports" className="reports-card linkup-card">
            <div className="settings-card-heading"><span><BarChart3 size={18} /></span><div><h2>{fr.settings.reports}</h2><p>{fr.settings.recentActivity}</p></div></div>
            {reports.filter((report) => report.status === "pending").length ? reports.filter((report) => report.status === "pending").map((report) => <div className="report-item" key={report.id}><strong>{report.reason}</strong><small>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(report.createdAt))}</small><Button variant="secondary" size="sm" onClick={() => void resolveReport(report.id)}><Check size={14} />{fr.settings.resolve}</Button></div>) : <p className="report-empty">{fr.settings.noReports}</p>}
          </Card>
        </div>
      </div>}
    </section>
  );
}
