// ─────────────────────────────────────────────
// Phase 78: Data Retention & Archival Policy Engine
// Provides logical archiving and restore functionality without destructive automatic deletion.
// ─────────────────────────────────────────────

export interface ArchivableRecord {
  id: string;
  isArchived?: boolean;
  archivedAt?: string;
  createdAt: string;
  [key: string]: any;
}

export function archiveRecordsOlderThan<T extends ArchivableRecord>(
  records: T[],
  cutoffDays: number = 90
): {
  archived: T[];
  active: T[];
  archivedCount: number;
} {
  const cutoffTime = Date.now() - cutoffDays * 24 * 60 * 60 * 1000;
  const nowStr = new Date().toISOString();

  const active: T[] = [];
  const archived: T[] = [];

  records.forEach((record) => {
    const recordTime = new Date(record.createdAt).getTime();
    if (recordTime < cutoffTime && !record.isArchived) {
      archived.push({
        ...record,
        isArchived: true,
        archivedAt: nowStr,
      });
    } else {
      active.push(record);
    }
  });

  return {
    archived,
    active,
    archivedCount: archived.length,
  };
}

export function restoreArchivedRecord<T extends ArchivableRecord>(
  record: T
): T {
  const { archivedAt, ...rest } = record;
  return {
    ...rest,
    isArchived: false,
  } as T;
}
