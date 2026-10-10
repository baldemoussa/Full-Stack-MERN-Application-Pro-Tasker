import { Link, useParams } from "react-router-dom";
import AppHeader from "../components/AppHeader";

export default function ProjectPage() {
  const { projectId } = useParams();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 p-6">
        <p>
          <Link className="text-teal-800 underline dark:text-teal-300" to="/dashboard">
            Back to projects
          </Link>
        </p>
        <h1 className="mt-4 text-2xl font-semibold">Project</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-300">Project id: {projectId}</p>
      </main>
    </div>
  );
}
