import { describe, it, expect } from "vitest";
import { convertToCsv } from "@/lib/services/exportService";

describe("Phase 22 — Data Export & Serialization", () => {
  it("converts expense records to well-formed CSV", () => {
    const expenses = [
      { date: "2026-06-15", category: "seeds", amount: 4500, note: "Hybrid Tomato F1" },
      { date: "2026-06-20", category: "fertilizers", amount: 3200, note: "DAP & Urea" },
    ];

    const csv = convertToCsv(expenses, [
      { key: "date", header: "Date" },
      { key: "category", header: "Category" },
      { key: "amount", header: "Amount" },
      { key: "note", header: "Note" },
    ]);

    expect(csv).toContain('"Date","Category","Amount","Note"');
    expect(csv).toContain('"2026-06-15","seeds","4500","Hybrid Tomato F1"');
    expect(csv).toContain('"2026-06-20","fertilizers","3200","DAP & Urea"');
  });

  it("handles empty records gracefully with headers only", () => {
    const csv = convertToCsv([], [
      { key: "date" as any, header: "Date" },
      { key: "amount" as any, header: "Amount" },
    ]);

    expect(csv.trim()).toBe('"Date","Amount"');
  });
});
