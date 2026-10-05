import { Link, useParams } from "react-router-dom";
import AppHeader from "../components/AppHeader";

export default function ProjectPage() {
  const { projectId } = useParams();

  return (
    <>
      <AppHeader />
      <main className="p-6">
        <p>
          <Link className="text-teal-800 underline" to="/dashboard">
            Back to projects
          </Link>
        </p>
        <h1 className="mt-4 text-2xl font-semibold">Project</h1>
        <p className="mt-2 text-stone-600">Project id: {projectId}</p>
      </main>
    </>
  );
}
