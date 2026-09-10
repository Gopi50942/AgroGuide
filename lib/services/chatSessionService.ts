import { createOwned, listOwned, updateOwned, removeOwned, listByField } from "@/lib/firebase/firestore";
import type { ChatSession, ChatMessage, Language } from "@/types";

// ─────────────────────────────────────────────
// Real persistent AI chat sessions and messages.
// ─────────────────────────────────────────────

export interface PersistedChatMessage {
  id: string;
  ownerId: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export async function listChatSessions(ownerId: string): Promise<ChatSession[]> {
  const list = await listOwned<ChatSession>("chat_sessions", ownerId);
  return list.sort((a, b) => (b.lastMessageAt || b.createdAt || "").localeCompare(a.lastMessageAt || a.createdAt || ""));
}

export async function createChatSession(
  ownerId: string,
  title: string,
  language: Language = "en",
  cropId?: string
): Promise<string> {
  const now = new Date().toISOString();
  return createOwned("chat_sessions", ownerId, {
    title,
    language,
    cropId: cropId || undefined,
    lastMessageAt: now,
    updatedAt: now,
  } as Record<string, unknown>);
}

export async function updateChatSession(id: string, data: Partial<ChatSession>): Promise<void> {
  return updateOwned("chat_sessions", id, {
    ...data,
    updatedAt: new Date().toISOString(),
  } as Record<string, unknown>);
}

export async function removeChatSession(sessionId: string): Promise<void> {
  // First remove session doc
  await removeOwned("chat_sessions", sessionId);
  // Remove messages in this session
  const messages = await listByField<PersistedChatMessage>("chat_messages", "sessionId", sessionId);
  await Promise.all(messages.map((m) => removeOwned("chat_messages", m.id).catch(() => null)));
}

export async function listSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const list = await listByField<PersistedChatMessage>("chat_messages", "sessionId", sessionId);
  return list
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }));
}

export async function addSessionMessage(
  ownerId: string,
  sessionId: string,
  role: "user" | "assistant",
  content: string
): Promise<string> {
  const now = new Date().toISOString();
  const id = await createOwned("chat_messages", ownerId, {
    sessionId,
    role,
    content,
    createdAt: now,
  } as Record<string, unknown>);

  // Update lastMessageAt on session
  await updateChatSession(sessionId, { lastMessageAt: now }).catch(() => null);

  return id;
}
