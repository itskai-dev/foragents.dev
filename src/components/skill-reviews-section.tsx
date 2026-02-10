"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { SkillReview } from "@/lib/reviews";

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={filled ? "h-4 w-4 text-cyan" : "h-4 w-4 text-muted-foreground/40"}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M10 1.5l2.66 5.39 5.95.86-4.3 4.2 1.01 5.93L10 15.9 4.68 17.88l1.01-5.93-4.3-4.2 5.95-.86L10 1.5z" />
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} filled={i < r} />
      ))}
    </div>
  );
}

function formatDate(dateKey: string): string {
  try {
    const d = new Date(dateKey);
    if (!Number.isFinite(d.getTime())) return dateKey;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateKey;
  }
}

function RatingInput({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Choose a rating from 1 to 5">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= value;

        return (
          <button
            key={starValue}
            type="button"
            aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
            aria-checked={filled}
            role="radio"
            className="rounded p-1 hover:bg-white/5"
            onClick={() => onChange(starValue)}
          >
            <StarIcon filled={filled} />
          </button>
        );
      })}
      <span className="ml-2 text-xs text-muted-foreground">{value}/5</span>
    </div>
  );
}

export function SkillReviewsSection({
  skillSlug,
  skillName,
  initialReviews,
}: {
  skillSlug: string;
  skillName: string;
  initialReviews: SkillReview[];
}) {
  const [sort, setSort] = useState<"recent" | "highest">("recent");
  const [reviews, setReviews] = useState<SkillReview[]>(initialReviews);

  const [formOpen, setFormOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitPending, setSubmitPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/reviews?skill=${encodeURIComponent(skillSlug)}&sort=${encodeURIComponent(sort)}`,
        );
        const data = (await res.json()) as { reviews?: SkillReview[] };

        if (!cancelled && res.ok && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      } catch {
        // ignore fetch errors and keep SSR reviews
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [skillSlug, sort]);

  const computed = useMemo(() => {
    const count = reviews.length;
    const avg = count === 0 ? 0 : reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / count;

    return { count, avg };
  }, [reviews]);

  async function submitReview(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const payload = {
      skillSlug,
      author: author.trim(),
      rating,
      title: title.trim(),
      body: body.trim(),
    };

    if (!payload.title || !payload.body) {
      setSubmitError("Please fill in title and review text.");
      return;
    }

    setSubmitPending(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { review?: SkillReview; error?: string; details?: string[] };

      if (!res.ok || !data.review) {
        setSubmitError(data.error || data.details?.join(" ") || "Failed to submit review.");
        return;
      }

      setReviews((prev) => [data.review!, ...prev]);
      setFormOpen(false);
      setAuthor("");
      setRating(5);
      setTitle("");
      setBody("");
      setSubmitSuccess("Thanks — your review was submitted.");
    } catch {
      setSubmitError("Failed to submit review.");
    } finally {
      setSubmitPending(false);
    }
  }

  return (
    <section className="mb-8" id="reviews">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div>
          <h2 className="text-lg font-semibold text-[#F8FAFC]">Reviews</h2>
          <div className="mt-1 flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Stars rating={computed.avg} />
              <span className="text-foreground/80">{computed.avg.toFixed(1)}</span>
            </div>
            <span className="text-white/20">•</span>
            <span>{computed.count} review{computed.count === 1 ? "" : "s"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="review-sort">
            Sort
          </label>
          <select
            id="review-sort"
            className="h-8 rounded-md border border-white/10 bg-black/30 px-2 text-sm text-foreground"
            value={sort}
            onChange={(e) => setSort(e.target.value as "recent" | "highest")}
          >
            <option value="recent">Most recent</option>
            <option value="highest">Highest rated</option>
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-cyan/25 bg-cyan/5 text-cyan hover:bg-cyan/10"
            onClick={() => {
              setFormOpen(true);
              const el = document.getElementById("write-review");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            Write a review
          </Button>
        </div>
      </div>

      {submitSuccess ? <p className="mb-3 text-sm text-emerald-300">{submitSuccess}</p> : null}

      {computed.count === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-muted-foreground">
            No reviews yet for <span className="text-foreground">{skillName}</span>. Be the first.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <article key={r.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-[#F8FAFC]">{r.title}</h3>
                    <Stars rating={r.rating} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <span className="text-foreground/80">{r.author || "anonymous"}</span>
                    <span className="mx-2 text-white/20">•</span>
                    <span>{formatDate(r.createdAt)}</span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{r.body}</p>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 id="write-review" className="text-sm font-semibold text-[#F8FAFC]">
            Write a review
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setFormOpen((v) => !v)}
          >
            {formOpen ? "Hide" : "Show"}
          </Button>
        </div>

        {formOpen ? (
          <form onSubmit={submitReview} className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs text-muted-foreground mb-3">
              Reviews are public and help other agents decide if <span className="text-foreground">{skillName}</span> is a good fit.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm">
                <div className="text-xs text-muted-foreground mb-1">Author name</div>
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. scout-agent"
                  className="w-full h-9 rounded-md border border-white/10 bg-black/30 px-3 text-sm"
                />
              </label>

              <label className="text-sm">
                <div className="text-xs text-muted-foreground mb-1">Rating</div>
                <RatingInput value={rating} onChange={setRating} />
              </label>
            </div>

            <label className="block mt-3">
              <div className="text-xs text-muted-foreground mb-1">Title</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What stood out?"
                className="w-full h-9 rounded-md border border-white/10 bg-black/30 px-3 text-sm"
              />
            </label>

            <label className="block mt-3">
              <div className="text-xs text-muted-foreground mb-1">Review</div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share details: what you used it for, gotchas, how it compares..."
                className="w-full min-h-[120px] rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm"
              />
            </label>

            {submitError ? <p className="mt-2 text-sm text-red-300">{submitError}</p> : null}

            <div className="mt-4 flex items-center gap-2">
              <Button type="submit" disabled={submitPending} className="bg-cyan text-black hover:brightness-110">
                {submitPending ? "Submitting..." : "Submit review"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={submitPending}
                className="border-white/10 bg-white/[0.03]"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </section>
  );
}
