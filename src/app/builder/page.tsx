/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";

type DraftStatus = "draft" | "published";

type DraftFile = {
  name: string;
  content: string;
};

type SkillDraft = {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  author: string;
  tags: string[];
  files: DraftFile[];
  createdAt: string;
  updatedAt: string;
  status: DraftStatus;
};

type DraftInput = {
  name: string;
  description: string;
  version: string;
  author: string;
  tags: string[];
  files: DraftFile[];
  status: DraftStatus;
};

const EMPTY_DRAFT: DraftInput = {
  name: "",
  description: "",
  version: "0.1.0",
  author: "",
  tags: [],
  files: [{ name: "SKILL.md", content: "# New Skill\n" }],
  status: "draft",
};

export default function BuilderPage() {
  const [drafts, setDrafts] = useState<SkillDraft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editor, setEditor] = useState<DraftInput>(EMPTY_DRAFT);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedDraft = useMemo(
    () => drafts.find((draft) => draft.id === selectedId) ?? null,
    [drafts, selectedId]
  );

  useEffect(() => {
    void loadDrafts();
  }, []);

  const loadDrafts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/builder", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load drafts");

      const data = (await response.json()) as { drafts?: SkillDraft[] };
      const nextDrafts = Array.isArray(data.drafts) ? data.drafts : [];
      setDrafts(nextDrafts);

      if (nextDrafts.length > 0) {
        const current = selectedId
          ? nextDrafts.find((draft) => draft.id === selectedId)
          : nextDrafts[0];

        if (current) {
          setSelectedId(current.id);
          setEditor(toInput(current));
          setSelectedFileIndex(0);
        }
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load drafts");
    } finally {
      setLoading(false);
    }
  };

  const toInput = (draft: SkillDraft): DraftInput => ({
    name: draft.name,
    description: draft.description,
    version: draft.version,
    author: draft.author,
    tags: draft.tags,
    files: draft.files.length > 0 ? draft.files : [{ name: "SKILL.md", content: "" }],
    status: draft.status,
  });

  const selectDraft = (draft: SkillDraft) => {
    setSelectedId(draft.id);
    setEditor(toInput(draft));
    setSelectedFileIndex(0);
    setMessage(null);
    setError(null);
  };

  const newDraft = () => {
    setSelectedId(null);
    setEditor(EMPTY_DRAFT);
    setSelectedFileIndex(0);
    setMessage("Creating a new draft. Save when ready.");
    setError(null);
  };

  const saveDraft = async () => {
    if (!editor.name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      ...editor,
      tags: editor.tags,
      files: editor.files,
    };

    try {
      const response = await fetch(selectedId ? `/api/builder/${selectedId}` : "/api/builder", {
        method: selectedId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(selectedId ? "Failed to save draft" : "Failed to create draft");
      }

      const data = (await response.json()) as { draft?: SkillDraft };
      if (data.draft) {
        const updatedDraft = data.draft;
        setDrafts((prev) => {
          const exists = prev.some((draft) => draft.id === updatedDraft.id);
          if (!exists) return [updatedDraft, ...prev];
          return prev.map((draft) => (draft.id === updatedDraft.id ? updatedDraft : draft));
        });
        setSelectedId(updatedDraft.id);
        setEditor(toInput(updatedDraft));
      }

      setMessage(selectedId ? "Draft saved." : "Draft created.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const publishDraft = async () => {
    if (!selectedId) {
      setError("Save this draft before publishing.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/builder/${selectedId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...editor, status: "published" }),
      });

      if (!response.ok) throw new Error("Failed to publish draft");

      const data = (await response.json()) as { draft?: SkillDraft };
      if (data.draft) {
        setDrafts((prev) => prev.map((draft) => (draft.id === data.draft?.id ? data.draft : draft)));
        setEditor(toInput(data.draft));
      }

      setMessage("Draft published.");
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "Publish failed.");
    } finally {
      setSaving(false);
    }
  };

  const deleteDraft = async (id: string) => {
    const confirmed = window.confirm("Delete this draft?");
    if (!confirmed) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/builder/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete draft");

      const nextDrafts = drafts.filter((draft) => draft.id !== id);
      setDrafts(nextDrafts);

      if (selectedId === id) {
        const nextSelected = nextDrafts[0] ?? null;
        setSelectedId(nextSelected?.id ?? null);
        setEditor(nextSelected ? toInput(nextSelected) : EMPTY_DRAFT);
      }

      setMessage("Draft deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Delete failed.");
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || editor.tags.includes(tag)) return;
    setEditor((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setEditor((prev) => ({
      ...prev,
      tags: prev.tags.filter((item) => item !== tag),
    }));
  };

  const addFile = () => {
    const file = { name: `file-${editor.files.length + 1}.md`, content: "" };
    setEditor((prev) => ({
      ...prev,
      files: [...prev.files, file],
    }));
    setSelectedFileIndex(editor.files.length);
  };

  const removeFile = (index: number) => {
    if (editor.files.length <= 1) {
      setError("At least one file is required.");
      return;
    }

    setEditor((prev) => ({
      ...prev,
      files: prev.files.filter((_, fileIndex) => fileIndex !== index),
    }));
    setSelectedFileIndex((prev) => Math.max(0, prev - (prev >= index ? 1 : 0)));
  };

  const updateFile = (index: number, key: keyof DraftFile, value: string) => {
    setEditor((prev) => ({
      ...prev,
      files: prev.files.map((file, fileIndex) =>
        fileIndex === index ? { ...file, [key]: value } : file
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-4xl font-bold">Skill <span className="aurora-text">Builder</span></h1>
            <p className="text-muted-foreground mt-2">Build, save, and publish reusable skills.</p>
          </div>
          <button
            onClick={newDraft}
            className="px-4 py-2 rounded-lg bg-cyan text-background font-medium hover:bg-cyan/90 transition-colors"
          >
            + New Draft
          </button>
        </div>

        {error && <p className="mb-4 text-red-400 text-sm">{error}</p>}
        {message && <p className="mb-4 text-green-400 text-sm">{message}</p>}

        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          <aside className="bg-card border border-white/10 rounded-xl p-4 h-fit">
            <h2 className="text-lg font-semibold mb-3">Drafts</h2>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading drafts...</p>
            ) : drafts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No drafts yet.</p>
            ) : (
              <div className="space-y-2">
                {drafts.map((draft) => (
                  <button
                    key={draft.id}
                    type="button"
                    onClick={() => selectDraft(draft)}
                    className={`w-full text-left rounded-lg border px-3 py-3 transition-colors ${
                      selectedId === draft.id
                        ? "border-cyan/40 bg-cyan/10"
                        : "border-white/10 bg-background/40 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">{draft.name}</p>
                      <span
                        className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded-full border ${
                          draft.status === "published"
                            ? "text-green-400 border-green-400/30 bg-green-400/10"
                            : "text-amber-300 border-amber-300/30 bg-amber-300/10"
                        }`}
                      >
                        {draft.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{draft.slug}</p>
                  </button>
                ))}
              </div>
            )}

            {selectedDraft && (
              <button
                onClick={() => deleteDraft(selectedDraft.id)}
                disabled={saving}
                className="mt-4 w-full px-3 py-2 rounded-lg border border-red-400/30 text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                Delete Selected Draft
              </button>
            )}
          </aside>

          <section className="bg-card border border-white/10 rounded-xl p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                <input
                  id="name"
                  value={editor.name}
                  onChange={(event) => setEditor((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Skill name"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-white/10 focus:outline-none focus:border-cyan/50"
                />
              </div>

              <div>
                <label htmlFor="version" className="block text-sm font-medium mb-2">Version</label>
                <input
                  id="version"
                  value={editor.version}
                  onChange={(event) => setEditor((prev) => ({ ...prev, version: event.target.value }))}
                  placeholder="0.1.0"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-white/10 focus:outline-none focus:border-cyan/50"
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
              <textarea
                id="description"
                value={editor.description}
                onChange={(event) => setEditor((prev) => ({ ...prev, description: event.target.value }))}
                rows={3}
                placeholder="What does this skill do?"
                className="w-full px-3 py-2 rounded-lg bg-background border border-white/10 focus:outline-none focus:border-cyan/50 resize-none"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="author" className="block text-sm font-medium mb-2">Author</label>
              <input
                id="author"
                value={editor.author}
                onChange={(event) => setEditor((prev) => ({ ...prev, author: event.target.value }))}
                placeholder="Team or author name"
                className="w-full px-3 py-2 rounded-lg bg-background border border-white/10 focus:outline-none focus:border-cyan/50"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a tag"
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-white/10 focus:outline-none focus:border-cyan/50"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 rounded-lg bg-cyan/20 border border-cyan/30 text-cyan hover:bg-cyan/30"
                >
                  Add
                </button>
              </div>

              {editor.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {editor.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="px-2 py-1 rounded-md text-xs bg-cyan/15 border border-cyan/30 text-cyan"
                    >
                      {tag} ×
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Files</h3>
                <button
                  type="button"
                  onClick={addFile}
                  className="px-3 py-2 rounded-lg bg-cyan/20 border border-cyan/30 text-cyan hover:bg-cyan/30"
                >
                  + Add File
                </button>
              </div>

              <div className="grid md:grid-cols-[220px_1fr] gap-4">
                <div className="space-y-2">
                  {editor.files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className={`rounded-lg border px-3 py-2 ${
                        selectedFileIndex === index
                          ? "border-cyan/40 bg-cyan/10"
                          : "border-white/10 bg-background/40"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedFileIndex(index)}
                        className="w-full text-left text-sm truncate"
                      >
                        {file.name || `file-${index + 1}.md`}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-xs text-red-300 mt-1 hover:text-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">File Name</label>
                    <input
                      value={editor.files[selectedFileIndex]?.name ?? ""}
                      onChange={(event) => updateFile(selectedFileIndex, "name", event.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-white/10 focus:outline-none focus:border-cyan/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">File Content</label>
                    <textarea
                      rows={14}
                      value={editor.files[selectedFileIndex]?.content ?? ""}
                      onChange={(event) => updateFile(selectedFileIndex, "content", event.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-white/10 focus:outline-none focus:border-cyan/50 resize-y font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={saveDraft}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-cyan text-background font-medium hover:bg-cyan/90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>

              <button
                onClick={publishDraft}
                disabled={saving || !selectedId || editor.status === "published"}
                className="px-5 py-2 rounded-lg border border-green-400/40 text-green-300 hover:bg-green-500/10 disabled:opacity-50"
              >
                {editor.status === "published" ? "Published" : "Publish"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
