import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { motion } from "motion/react";
import type { Task, TaskBoardProps, TaskStatus } from "../types";
import TaskColumn from "./TaskColumn";
import { TaskCardFace } from "./TaskCard";

const STATUSES: TaskStatus[] = ["To Do", "In Progress", "Done"];

function isStatus(value: string): value is TaskStatus {
  return STATUSES.includes(value as TaskStatus);
}

function statusFromDrop(event: DragEndEvent, tasks: Task[]): TaskStatus | null {
  if (!event.over) {
    return null;
  }

  const overId = String(event.over.id);
  if (isStatus(overId)) {
    return overId;
  }

  const containerId = event.over.data.current?.sortable?.containerId;
  if (typeof containerId === "string" && isStatus(containerId)) {
    return containerId;
  }

  return tasks.find((task) => task._id === overId)?.status ?? null;
}

export default function TaskBoard({ tasks, canEdit, onMove, onEdit, onDelete }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((item) => item._id === String(event.active.id));
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    if (!canEdit) {
      return;
    }

    const task = tasks.find((item) => item._id === String(event.active.id));
    const nextStatus = statusFromDrop(event, tasks);
    if (!task || !nextStatus || task.status === nextStatus) {
      return;
    }
    onMove(task, nextStatus);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="mt-6 grid flex-1 content-stretch gap-4 md:grid-cols-3">
        {STATUSES.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasks.filter((task) => task.status === status)}
            canEdit={canEdit}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <motion.article
            initial={{ scale: 1 }}
            animate={{ scale: 1.04, rotate: 1.5 }}
            className="cursor-grabbing rounded-xl border border-teal-700 bg-white p-4 shadow-xl dark:bg-stone-800"
          >
            <TaskCardFace task={activeTask} />
          </motion.article>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
