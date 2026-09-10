"use client";

import { useEffect, useState } from "react";
import { Plus, Check, Trash2, CalendarDays } from "lucide-react";
import { DEMO_TASKS } from "@/data/demoData";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import { listTasks, addTask as addTaskFs, updateTask, removeTask } from "@/lib/services/taskService";
import { listCrops } from "@/lib/services/farmService";
import { SectionHeading, EmptyState } from "@/components/ui/Primitives";
import type { CropTask, Crop } from "@/types";

const CATEGORY_KEYS: CropTask["category"][] = [
  "land_preparation",
  "sowing",
  "irrigation",
  "fertilization",
  "weeding",
  "pest_inspection",
  "disease_inspection",
  "pruning",
  "harvest_preparation",
];

export default function CalendarPage() {
  const { profile, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<CropTask[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<CropTask["category"]>("irrigation");
  const [newDate, setNewDate] = useState("");

  async function refresh() {
    if (!profile) return;
    if (isDemoMode) {
      setTasks(DEMO_TASKS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [taskList, cropList] = await Promise.all([listTasks(profile.uid), listCrops(profile.uid)]);
    setTasks(taskList);
    setCrops(cropList);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, isDemoMode]);

  const pending = tasks.filter((task) => !task.completed).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const completed = tasks.filter((task) => task.completed);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newDate || !profile) return;

    if (isDemoMode) {
      setTasks((prev) => [
        ...prev,
        { id: crypto.randomUUID(), ownerId: profile.uid, cropId: crops[0]?.id ?? "", title: newTitle, category: newCategory, dueDate: newDate, completed: false },
      ]);
      setNewTitle("");
      setNewDate("");
      return;
    }

    try {
      await addTaskFs(profile.uid, {
        cropId: crops[0]?.id ?? "",
        title: newTitle.trim(),
        category: newCategory,
        dueDate: newDate,
        completed: false,
      });
      setNewTitle("");
      setNewDate("");
      refresh();
    } catch {
      showToast(t("common.error"), "warning");
    }
  }

  async function toggleTask(id: string) {
    const task = tasks.find((tk) => tk.id === id);
    if (!task) return;
    setTasks((prev) => prev.map((tk) => (tk.id === id ? { ...tk, completed: !tk.completed } : tk)));
    if (!isDemoMode) {
      try {
        await updateTask(id, { completed: !task.completed });
      } catch {
        showToast(t("common.error"), "warning");
        refresh();
      }
    }
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((tk) => tk.id !== id));
    if (!isDemoMode) {
      try {
        await removeTask(id);
      } catch {
        showToast(t("common.error"), "warning");
        refresh();
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionHeading eyebrow={t("nav.calendar")} title={t("calendar.title")} />

      <form onSubmit={addTask} className="card p-4 grid sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
        <div>
          <label className="label-field">{t("calendar.task")}</label>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="input-field"
            placeholder={t("calendar.taskPlaceholder")}
          />
        </div>
        <div>
          <label className="label-field">{t("calendar.category")}</label>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as CropTask["category"])}
            className="input-field"
          >
            {CATEGORY_KEYS.map((k) => (
              <option key={k} value={k}>
                {(t as any)(`task.cat.${k}`) || k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">{t("calendar.dueDate")}</label>
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="input-field" />
        </div>
        <button type="submit" className="btn-primary h-[46px]">
          <Plus size={16} /> {t("calendar.add")}
        </button>
      </form>

      {loading ? (
        <div className="skeleton h-24" />
      ) : (
        <>
          <div>
            <SectionHeading title={`${t("calendar.pending")} (${pending.length})`} />
            {pending.length === 0 ? (
              <EmptyState icon={CalendarDays} title={t("calendar.noPendingTitle")} message={t("calendar.noPendingMessage")} />
            ) : (
              <div className="space-y-2">
                {pending.map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                ))}
              </div>
            )}
          </div>

          {completed.length > 0 && (
            <div>
              <SectionHeading title={`${t("calendar.completed")} (${completed.length})`} />
              <div className="space-y-2 opacity-70">
                {completed.map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: CropTask;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useLanguage();
  const categoryLabel = (t as any)(`task.cat.${task.category}`) || task.category;

  return (
    <div className="card p-3.5 flex items-center gap-3">
      <button
        onClick={() => onToggle(task.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
          task.completed ? "bg-forest-600 border-forest-600 text-cream-50" : "border-forest-200"
        }`}
        aria-label="Toggle complete"
      >
        {task.completed && <Check size={13} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${task.completed ? "line-through text-ink-light" : ""}`}>{task.title}</p>
        <p className="text-xs text-ink-light">{categoryLabel} · {task.dueDate}</p>
      </div>
      <button onClick={() => onDelete(task.id)} className="p-2 text-ink-light hover:text-rust-500" aria-label="Delete task">
        <Trash2 size={15} />
      </button>
    </div>
  );
}

