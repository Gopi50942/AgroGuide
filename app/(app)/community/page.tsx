"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Flag,
  Plus,
  Trash2,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { DEMO_COMMUNITY_POSTS } from "@/data/demoData";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import {
  listCommunityPosts,
  createCommunityPost,
  removeCommunityPost,
  uploadCommunityMedia,
  togglePostLike,
  checkUserLikedPost,
  getPostLikeCount,
  listPostComments,
  addPostComment,
  removePostComment,
} from "@/lib/services/communityService";
import { SectionHeading } from "@/components/ui/Primitives";
import { VoiceNoteRecorder } from "@/components/community/VoiceNoteRecorder";
import { AudioVoicePlayer } from "@/components/community/AudioVoicePlayer";
import type { CommunityPost, CommunityComment } from "@/types";

const CATEGORY_KEYS: (CommunityPost["category"] | "all")[] = [
  "all",
  "crop",
  "disease",
  "market",
  "government",
  "irrigation",
  "equipment",
  "general",
];

export default function CommunityPage() {
  const { profile, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, CommunityComment[]>>({});
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});
  const [loadingCommentsMap, setLoadingCommentsMap] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CommunityPost["category"] | "all">("all");
  const [showNew, setShowNew] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<CommunityPost["category"]>("general");
  const [posting, setPosting] = useState(false);

  // Attachments state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function refresh() {
    if (!profile) return;
    if (isDemoMode) {
      setPosts(DEMO_COMMUNITY_POSTS);
      const initialCounts: Record<string, number> = {};
      DEMO_COMMUNITY_POSTS.forEach((p) => {
        initialCounts[p.id] = p.likes;
      });
      setLikeCountMap(initialCounts);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fetchedPosts = await listCommunityPosts();
      setPosts(fetchedPosts);

      // Load user like statuses & actual like counts
      const userLikes: Record<string, boolean> = {};
      const actualCounts: Record<string, number> = {};

      await Promise.all(
        fetchedPosts.map(async (p) => {
          const [hasLiked, count] = await Promise.all([
            checkUserLikedPost(p.id, profile.uid),
            getPostLikeCount(p.id),
          ]);
          userLikes[p.id] = hasLiked;
          actualCounts[p.id] = count || p.likes || 0;
        })
      );

      setLikedMap(userLikes);
      setLikeCountMap(actualCounts);
    } catch {
      showToast(t("community.loadError"), "warning");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, isDemoMode]);

  const filtered = useMemo(
    () => (filter === "all" ? posts : posts.filter((p) => p.category === filter)),
    [posts, filter]
  );

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast("Image must be under 8MB.");
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleLikeToggle(postId: string) {
    if (!profile) return;
    const isCurrentlyLiked = !!likedMap[postId];
    const currentCount = likeCountMap[postId] ?? 0;

    // Optimistic update
    setLikedMap((prev) => ({ ...prev, [postId]: !isCurrentlyLiked }));
    setLikeCountMap((prev) => ({
      ...prev,
      [postId]: isCurrentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
    }));

    if (isDemoMode) return;

    try {
      await togglePostLike(postId, profile.uid);
    } catch {
      // Revert on failure
      setLikedMap((prev) => ({ ...prev, [postId]: isCurrentlyLiked }));
      setLikeCountMap((prev) => ({ ...prev, [postId]: currentCount }));
    }
  }

  async function toggleCommentsSection(postId: string) {
    const nextState = !expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: nextState }));

    if (nextState && !commentsMap[postId]) {
      setLoadingCommentsMap((prev) => ({ ...prev, [postId]: true }));
      if (isDemoMode) {
        setCommentsMap((prev) => ({ ...prev, [postId]: [] }));
        setLoadingCommentsMap((prev) => ({ ...prev, [postId]: false }));
        return;
      }
      try {
        const comments = await listPostComments(postId);
        setCommentsMap((prev) => ({ ...prev, [postId]: comments }));
      } catch {
        // Fallback
      } finally {
        setLoadingCommentsMap((prev) => ({ ...prev, [postId]: false }));
      }
    }
  }

  async function handleAddComment(postId: string) {
    const text = commentInputMap[postId]?.trim();
    if (!text || !profile) return;

    const newCommentObj: CommunityComment = {
      id: crypto.randomUUID(),
      ownerId: profile.uid,
      postId,
      authorName: profile.name,
      content: text,
      createdAt: new Date().toISOString(),
    };

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newCommentObj],
    }));
    setCommentInputMap((prev) => ({ ...prev, [postId]: "" }));

    if (isDemoMode) return;

    try {
      await addPostComment(profile.uid, postId, profile.name, text);
    } catch {
      showToast(t("common.error"), "warning");
    }
  }

  async function handleDeleteComment(postId: string, commentId: string) {
    if (!confirm(t("community.deleteCommentConfirm"))) return;

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: prev[postId]?.filter((c) => c.id !== commentId) || [],
    }));
    showToast(t("community.commentDeleted"), "success");

    if (isDemoMode) return;

    try {
      await removePostComment(commentId);
    } catch {
      // Non-fatal
    }
  }

  async function handleDeletePost(postId: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast("Post deleted", "success");

    if (isDemoMode) return;

    try {
      await removeCommunityPost(postId);
    } catch {
      showToast(t("common.error"), "warning");
    }
  }

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim() || !profile) return;

    setPosting(true);

    try {
      let uploadedImageUrl: string | undefined = undefined;
      let uploadedAudioUrl: string | undefined = undefined;

      if (selectedImage) {
        uploadedImageUrl = await uploadCommunityMedia(profile.uid, selectedImage, "image", isDemoMode);
      }

      if (audioBlob) {
        uploadedAudioUrl = await uploadCommunityMedia(profile.uid, audioBlob, "audio", isDemoMode);
      }

      if (isDemoMode) {
        const newDemoPost: CommunityPost = {
          id: crypto.randomUUID(),
          ownerId: profile.uid,
          authorName: profile.name,
          category: newCategory,
          content: newContent.trim(),
          imageUrl: uploadedImageUrl,
          audioUrl: uploadedAudioUrl,
          audioDurationSeconds: audioDuration || undefined,
          likes: 0,
          commentsCount: 0,
          createdAt: new Date().toISOString(),
        };
        setPosts((prev) => [newDemoPost, ...prev]);
        setLikeCountMap((prev) => ({ ...prev, [newDemoPost.id]: 0 }));
        setNewContent("");
        clearImage();
        setAudioBlob(null);
        setAudioDuration(0);
        setShowNew(false);
        setPosting(false);
        return;
      }

      await createCommunityPost(profile.uid, profile.name, {
        category: newCategory,
        content: newContent.trim(),
        imageUrl: uploadedImageUrl,
        audioUrl: uploadedAudioUrl,
        audioDurationSeconds: audioDuration || undefined,
      });

      setNewContent("");
      clearImage();
      setAudioBlob(null);
      setAudioDuration(0);
      setShowNew(false);
      refresh();
    } catch {
      showToast(t("common.error"), "warning");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionHeading
        eyebrow={t("nav.community")}
        title={t("community.title")}
        action={
          <button onClick={() => setShowNew((v) => !v)} className="btn-secondary text-sm">
            <Plus size={15} /> {t("community.newPost")}
          </button>
        }
      />

      {showNew && (
        <form onSubmit={submitPost} className="card p-4 space-y-3 bg-forest-50/40 border-forest-200">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={t("community.postPlaceholder")}
            className="input-field w-full min-h-[80px]"
            required
          />

          {/* Image Preview if selected */}
          {imagePreview && (
            <div className="relative inline-block mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Selected preview"
                className="w-32 h-24 object-cover rounded-xl border border-forest-200"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-rust-600 text-white rounded-full p-1 shadow hover:bg-rust-700"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Attachments & Action Controls */}
          <div className="flex items-center justify-between gap-3 flex-wrap pt-1 border-t border-forest-100">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as CommunityPost["category"])}
                className="input-field w-auto text-xs py-1.5"
              >
                {CATEGORY_KEYS.filter((c) => c !== "all").map((k) => (
                  <option key={k} value={k}>
                    {(t as any)(`community.cat.${k}`) || k}
                  </option>
                ))}
              </select>

              {/* Photo upload trigger */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-forest-700"
              >
                <ImageIcon size={13} /> {t("community.attachImage")}
              </button>

              {/* Voice Note Recorder (Phase 18) */}
              <VoiceNoteRecorder
                onAudioReady={(blob, duration) => {
                  setAudioBlob(blob);
                  setAudioDuration(duration);
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNew(false);
                  clearImage();
                  setAudioBlob(null);
                }}
                className="btn-secondary text-xs"
              >
                {t("common.cancel")}
              </button>
              <button type="submit" disabled={posting} className="btn-primary text-xs flex items-center gap-1">
                {posting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                {t("community.post")}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── Category Filters ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORY_KEYS.map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${
              filter === k
                ? "bg-forest-600 text-cream-50 border-forest-600 shadow-sm"
                : "border-forest-100 text-ink-light bg-cream-50"
            }`}
          >
            {(t as any)(`community.cat.${k}`) || k}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-6 text-sm text-ink-light text-center">{t("community.noPosts")}</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => {
            const isLiked = !likedMap[post.id];
            const likeCount = likeCountMap[post.id] ?? post.likes ?? 0;
            const isExpanded = !expandedComments[post.id];
            const postComments = commentsMap[post.id] || [];
            const isMyPost = profile?.uid && post.ownerId === profile.uid;

            return (
              <div key={post.id} className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-700 font-semibold flex items-center justify-center text-sm">
                      {post.authorName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-forest-950">{post.authorName}</p>
                      <p className="text-xs text-ink-light">
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="chip capitalize text-xs">
                      {(t as any)(`community.cat.${post.category}`) || post.category}
                    </span>
                    {isMyPost && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1 text-ink-light hover:text-rust-500 rounded"
                        title="Delete Post"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">{post.content}</p>

                {/* ── Attached Image (Phase 18) ── */}
                {post.imageUrl && (
                  <div className="pt-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.imageUrl}
                      alt="Post attachment"
                      className="max-h-72 w-auto rounded-xl border border-forest-100 object-cover"
                    />
                  </div>
                )}

                {/* ── Attached Voice Note (Phase 18) ── */}
                {post.audioUrl && (
                  <div className="pt-1">
                    <AudioVoicePlayer
                      src={post.audioUrl}
                      durationSeconds={post.audioDurationSeconds}
                    />
                  </div>
                )}

                {/* ── Action bar: Likes & Comments ── */}
                <div className="flex items-center gap-5 pt-3 border-t border-forest-100 text-ink-light text-sm">
                  <button
                    onClick={() => handleLikeToggle(post.id)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      isLiked ? "text-rust-500 font-semibold" : "hover:text-rust-500"
                    }`}
                  >
                    <Heart size={16} className={isLiked ? "fill-current" : ""} />
                    <span>{likeCount}</span>
                  </button>

                  <button
                    onClick={() => toggleCommentsSection(post.id)}
                    className="flex items-center gap-1.5 hover:text-forest-700 transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span>{postComments.length || post.commentsCount || 0}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* ── Comments Drawer ── */}
                {isExpanded && (
                  <div className="pt-3 border-t border-forest-100/70 space-y-3">
                    {loadingCommentsMap[post.id] ? (
                      <div className="text-xs text-ink-light flex items-center gap-2 py-2">
                        <Loader2 size={13} className="animate-spin" /> Loading comments…
                      </div>
                    ) : postComments.length === 0 ? (
                      <p className="text-xs text-ink-light py-1">{t("community.noComments")}</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {postComments.map((comment) => {
                          const isMyComment = profile?.uid && comment.ownerId === profile.uid;
                          return (
                            <div
                              key={comment.id}
                              className="bg-cream-100/60 p-2.5 rounded-xl text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-forest-950">
                                  {comment.authorName}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-ink-light">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                  {isMyComment && (
                                    <button
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                      className="text-ink-light hover:text-rust-500"
                                      title={t("community.deleteComment")}
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-ink leading-relaxed">{comment.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder={t("community.addComment")}
                        value={commentInputMap[post.id] || ""}
                        onChange={(e) =>
                          setCommentInputMap((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                        className="input-field flex-1 text-xs py-1.5"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentInputMap[post.id]?.trim()}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        <Send size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
