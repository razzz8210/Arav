'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { notFound } from 'next/navigation';
import { ProjectView } from './project-view';

function ProjectErrorFallback({ error }: { error: Error }) {
  if (error.message.includes('Project not found')) {
    notFound();
  }

  return (
    <div className="text-red-500">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

export function ProjectViewWithBoundary({ projectId }: { projectId: string }) {
  return (
    <ErrorBoundary FallbackComponent={ProjectErrorFallback}>
      <ProjectView projectId={projectId} />
    </ErrorBoundary>
  );
}
