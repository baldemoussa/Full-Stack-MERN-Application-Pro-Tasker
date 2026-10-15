import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { TaskColumnProps, TaskStatus } from "../types";
import TaskCard from "./TaskCard";

const columnTone: Record<TaskStatus, string> = {
  "To Do": "border-stone-200 bg-gradient-to-br from-stone-50 to-stone-100 dark:border-stone-700 dark:from-stone-900 dark:to-stone-800",
  "In Progress": "border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 dark:border-amber-900 dark:from-amber-950 dark:to-amber-900",
  Hold: "border-sky-200 bg-gradient-to-br from-sky-50 to-sky-100 dark:border-sky-900 dark:from-sky-950 dark:to-sky-900",
  Done: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:border-emerald-900 dark:from-emerald-950 dark:to-emerald-900",
};

const headerTone: Record<TaskStatus, string> = {
  "To Do": "border-stone-200 text-stone-700 dark:border-stone-700 dark:text-stone-200",
  "In Progress": "border-amber-200 text-amber-800 dark:border-amber-900 dark:text-amber-300",
  Hold: "border-sky-200 text-sky-800 dark:border-sky-900 dark:text-sky-300",
  Done: "border-emerald-200 text-emerald-800 dark:border-emerald-900 dark:text-emerald-300",
};

export default function TaskColumn({ status, tasks, canEdit, onEdit, onDelete, onComment }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status, disabled: !canEdit });
  const reduceMotion = useReducedMotion();

  return (
    <section className={`flex h-full flex-col gap-4 rounded-2xl border p-4 shadow-sm ${columnTone[status]} ${isOver ? "ring-2 ring-teal-700" : ""}`}>
      <h2 className={`border-b-2 pb-2 text-center text-sm font-black uppercase tracking-widest ${headerTone[status]}`}>
        {status} <span className="text-xs font-semibold opacity-75">({tasks.length})</span>
      </h2>
      <ul ref={setNodeRef} className="flex min-h-48 flex-1 flex-col gap-3">
        <SortableContext id={status} items={tasks.map((task) => task._id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence initial={false} mode="popLayout">
            {tasks.length === 0 ? (
              <li className="text-sm text-stone-500 dark:text-stone-400">No tasks</li>
            ) : (
              tasks.map((task) => (
                <motion.li
                  key={task._id}
                  layout
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.96 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                >
                  <TaskCard task={task} canEdit={canEdit} onEdit={onEdit} onDelete={onDelete} onComment={onComment} />
                </motion.li>
              ))
            )}
          </AnimatePresence>
        </SortableContext>
      </ul>
    </section>
  );
}
