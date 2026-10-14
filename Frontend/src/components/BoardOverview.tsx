import { motion, useReducedMotion } from "motion/react";
import type { Task } from "../types";

function count(tasks: Task[], status: Task["status"]) {
  return tasks.filter((task) => task.status === status).length;
}

const cards = [
  {
    label: "Total tasks",
    tone: "border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900",
    labelTone: "text-stone-500 dark:text-stone-400",
    valueTone: "text-stone-800 dark:text-stone-100",
    value: (tasks: Task[]) => tasks.length,
  },
  {
    label: "To Do",
    tone: "border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-900",
    labelTone: "text-stone-600 dark:text-stone-300",
    valueTone: "text-stone-800 dark:text-stone-100",
    value: (tasks: Task[]) => count(tasks, "To Do"),
  },
  {
    label: "In Progress",
    tone: "border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100 dark:border-amber-900 dark:from-amber-950 dark:to-amber-900",
    labelTone: "text-amber-800 dark:text-amber-300",
    valueTone: "text-amber-900 dark:text-amber-100",
    value: (tasks: Task[]) => count(tasks, "In Progress"),
  },
  {
    label: "Done",
    tone: "border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:border-emerald-900 dark:from-emerald-950 dark:to-emerald-900",
    labelTone: "text-emerald-800 dark:text-emerald-300",
    valueTone: "text-emerald-900 dark:text-emerald-100",
    value: (tasks: Task[]) => count(tasks, "Done"),
  },
];

export default function BoardOverview({ tasks }: { tasks: Task[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="mt-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">Overview</h3>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : index * 0.08 }}
            className={`flex flex-col items-center justify-center rounded-2xl border p-4 shadow-sm ${card.tone}`}
          >
            <span className={`text-xs font-semibold uppercase tracking-wider ${card.labelTone}`}>{card.label}</span>
            <span className={`mt-1 text-3xl font-black ${card.valueTone}`}>{card.value(tasks)}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
