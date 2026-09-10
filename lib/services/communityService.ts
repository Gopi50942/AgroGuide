import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/config";
import { createOwned, listAllOrdered, removeOwned, listByField } from "@/lib/firebase/firestore";
import { cleanFirestoreData } from "@/lib/firebase/cleanData";
import { uploadPublicImage, uploadPublicAudio } from "@/lib/services/fileStorage";
import type { CommunityPost, CommunityComment } from "@/types";

// ─────────────────────────────────────────────
// Real community posts, likes, comments, and media service.
// ─────────────────────────────────────────────

export async function listCommunityPosts(): Promise<CommunityPost[]> {
  return listAllOrdered<CommunityPost>("community_posts", "createdAt");
}

export async function createCommunityPost(
  ownerId: string,
  authorName: string,
  post: Pick<CommunityPost, "category" | "content"> & {
    imageUrl?: string;
    audioUrl?: string;
    audioDurationSeconds?: number;
  }
): Promise<string> {
  return createOwned("community_posts", ownerId, {
    authorName,
    category: post.category,
    content: post.content,
    imageUrl: post.imageUrl || null,
    audioUrl: post.audioUrl || null,
    audioDurationSeconds: post.audioDurationSeconds || null,
    likes: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Record<string, unknown>);
}

export async function removeCommunityPost(postId: string): Promise<void> {
  return removeOwned("community_posts", postId);
}

/**
 * Upload community media (image or audio note) using provider-neutral storage abstraction
 */
export async function uploadCommunityMedia(
  ownerId: string,
  file: File | Blob,
  mediaType: "image" | "audio",
  isDemoMode: boolean = false
): Promise<string> {
  const extension = mediaType === "image" ? "jpg" : "webm";
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

  if (mediaType === "image") {
    const res = await uploadPublicImage(
      file,
      fileName,
      {
        ownerId,
        folder: `agroguide/users/${ownerId}/community`,
        classification: "public_low_sensitivity",
      },
      isDemoMode
    );
    if (res.success && res.url) return res.url;
  } else {
    const res = await uploadPublicAudio(
      file,
      fileName,
      {
        ownerId,
        folder: `agroguide/users/${ownerId}/community`,
        classification: "public_low_sensitivity",
      },
      isDemoMode
    );
    if (res.success && res.url) return res.url;
  }

  // Fallback to local preview URL if running in demo or unconfigured
  if (typeof window !== "undefined") {
    return URL.createObjectURL(file);
  }
  return "";
}

// ── Likes Subcollection (community_posts/{postId}/likes/{userId}) ──

export async function checkUserLikedPost(postId: string, userId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId) return false;
  try {
    const snap = await getDoc(doc(db, "community_posts", postId, "likes", userId));
    return snap.exists();
  } catch {
    return false;
  }
}

export async function getPostLikeCount(postId: string): Promise<number> {
  if (!isFirebaseConfigured || !db) return 0;
  try {
    const postSnap = await getDoc(doc(db, "community_posts", postId));
    return postSnap.exists() ? (postSnap.data()?.likes || 0) : 0;
  } catch {
    return 0;
  }
}

export async function togglePostLike(
  postId: string,
  userId: string,
  userName: string = "Farmer"
): Promise<{ liked: boolean; newCount: number }> {
  if (!isFirebaseConfigured || !db || !userId) {
    return { liked: true, newCount: 1 };
  }

  const postRef = doc(db, "community_posts", postId);
  const likeRef = doc(db, "community_posts", postId, "likes", userId);
  const snap = await getDoc(likeRef);

  const postSnap = await getDoc(postRef);
  const currentLikes = postSnap.exists() ? (postSnap.data().likes || 0) : 0;

  if (snap.exists()) {
    // Unlike
    await deleteDoc(likeRef);
    const newCount = Math.max(0, currentLikes - 1);
    await setDoc(postRef, { likes: newCount }, { merge: true });
    return { liked: false, newCount };
  } else {
    // Like
    await setDoc(likeRef, {
      userId,
      userName,
      createdAt: serverTimestamp(),
    });
    const newCount = currentLikes + 1;
    await setDoc(postRef, { likes: newCount }, { merge: true });
    return { liked: true, newCount };
  }
}

export const toggleLikePost = togglePostLike;

// ── Comments Subcollection (community_posts/{postId}/comments/{commentId}) ──

export async function listPostComments(postId: string): Promise<CommunityComment[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const q = query(
      collection(db, "community_posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => cleanFirestoreData<CommunityComment>({ id: d.id, ...d.data() } as unknown as CommunityComment));
  } catch {
    return [];
  }
}

export async function addPostComment(
  postId: string,
  userId: string,
  authorName: string,
  content: string
): Promise<CommunityComment> {
  const newComment: Omit<CommunityComment, "id"> = {
    postId,
    ownerId: userId,
    authorName,
    content,
    createdAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured || !db) {
    return { id: `demo_comment_${Date.now()}`, ...newComment };
  }

  const commentsCol = collection(db, "community_posts", postId, "comments");
  const commentRef = doc(commentsCol);
  await setDoc(commentRef, {
    ...newComment,
    createdAt: serverTimestamp(),
  });

  // Increment comment count on parent post
  const postRef = doc(db, "community_posts", postId);
  const postSnap = await getDoc(postRef);
  const currentCount = postSnap.exists() ? (postSnap.data().commentsCount || 0) : 0;
  await setDoc(postRef, { commentsCount: currentCount + 1 }, { merge: true });

  return { id: commentRef.id, ...newComment };
}

export async function removePostComment(postIdOrCommentId: string, commentId?: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    if (commentId) {
      await deleteDoc(doc(db, "community_posts", postIdOrCommentId, "comments", commentId));
      const postRef = doc(db, "community_posts", postIdOrCommentId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const currentCount = postSnap.data()?.commentsCount || 0;
        await setDoc(postRef, { commentsCount: Math.max(0, currentCount - 1) }, { merge: true });
      }
    } else {
      await deleteDoc(doc(db, "community_comments", postIdOrCommentId));
    }
  } catch {}
}
