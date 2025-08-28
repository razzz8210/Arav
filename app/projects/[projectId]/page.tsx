import { getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProjectViewWithBoundary } from "@/modules/projects/ui/views/ProjectViewWithBoundary";
import dynamic from "next/dynamic";
import DynamicLoader from "@/components/lottie/DynamicLoader";


const Loader = dynamic(() => import("@/components/lottie/Loader"), {
  ssr: true,
  loading: () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
  ),
});

interface Props {
  params: Promise<{ projectId: string }>;
}

const Page = async ({ params }: Props) => {
  const { projectId } = await params;

  // Server-side authentication check with automatic redirect
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/signin");
  }

  // Prefetch data for authenticated users
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DynamicLoader />}>
        <ProjectViewWithBoundary projectId={projectId} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
