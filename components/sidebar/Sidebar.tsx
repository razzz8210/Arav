"use client";

import { AuthenticatedMenu } from "@/components/sidebar/AuthenticatedMenu";
import { DeleteProjectModal } from "@/components/sidebar/DeleteProjectModal";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import { useTRPC } from "@/trpc/client";
import { useAuth } from "@/utils/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronDown,
  CircleQuestionMark,
  Dock,
  Layers,
  Rocket,
  Settings,
  Trash2,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type UsedIn = "landingpage" | "project";
type MenuState = "open" | "collapsed" | "minimised";

const Sidebar: React.FC<{
  menuState: MenuState;
  toggleMenuState?: (state: MenuState) => void;
  usedIn: UsedIn;
  pinned?: boolean;
  setPinned?: (value: boolean) => void;
  onLogoClick?: () => void;
}> = ({
  menuState,
  toggleMenuState,
  usedIn,
  pinned = false,
  setPinned,
  onLogoClick,
}) => {
    const isExpanded = menuState === "open";
    const [projectsOpen, setProjectsOpen] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [isDeletingMongoData, setIsDeletingMongoData] = useState(false);
    const { user, loading } = useAuth();
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const router = useRouter();
    const params = useParams();

    const { data: projects = [], isLoading: projectsLoading } = useQuery({
      ...trpc.projects.getMany.queryOptions(),
      enabled: !!user, // Only fetch when user is authenticated
      refetchOnWindowFocus: false,
    });

    const deleteProjectMutation = useMutation({
      ...trpc.projects.delete.mutationOptions(),
      onSuccess: (data, variables) => {
        toast.success(
          "Project deleted successfully! All associated data has been cleaned up."
        );
        // Refetch projects to update the list
        queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());

        // Get the project ID that was deleted from the mutation variables
        const deletedProjectId = variables.id;

        // Check if we need to navigate away from the current project page
        const currentProjectId = params?.projectId as string;
        if (
          currentProjectId &&
          currentProjectId === deletedProjectId &&
          usedIn === "project"
        ) {
          toast.info(
            "Redirecting to home page since you deleted the current project..."
          );
          setTimeout(() => {
            router.push("/");
          }, 1000);
        }
      },
      onError: () => {
        toast.error("Failed to delete project data. Please try again.");
      },
    });

    const handleDevelopment = () => {
      toast.success("This section is under development!");
    };

    const handleSupport = () => {
      const email = "team@cracked.ai";
      const subject = "Support Request";

      // Try mailto (works for local mail clients)
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}`;

      // Open Gmail in new tab (works for Gmail users)
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(
          subject
        )}`,
        "_blank"
      );

      // Always fallback: copy email to clipboard
      navigator.clipboard
        .writeText(email)
        .then(() => {
          toast.success(`Email copied to clipboard: ${email}`);
        })
        .catch(() => {
          toast.info(`Please email us at: ${email}`);
        });
    };

    const handleLogoClick = () => {
      // If custom onLogoClick is provided, use it (for landing page behavior)
      if (onLogoClick) {
        onLogoClick();
        return;
      }

      // Default behavior for project pages
      if (pinned) {
        // unpin & minimise (so icons are still visible)
        if (setPinned) {
          setPinned(false);
          toggleMenuState?.("minimised");
        }
      } else {
        // pin sidebar open
        if (setPinned) {
          setPinned(true);
          toggleMenuState?.("open");
        }
      }
    };

    const handleProjectsOpen = () => {
      if (!isExpanded && !projectsOpen) {
        toggleMenuState?.("open");
        setProjectsOpen(true);
      } else if (isExpanded && projectsOpen) {
        setProjectsOpen(false);
      } else if (isExpanded && !projectsOpen) {
        setProjectsOpen(true);
      }
    };

    const handleDeleteProject = async (projectId: string) => {
      setProjectToDelete(projectId);
      setShowDeleteConfirm(true);
    };

    const confirmDeleteProject = async () => {
      if (!projectToDelete) return;

      // Store the project ID before clearing the state
      const projectIdToDelete = projectToDelete;

      try {
        setIsDeletingMongoData(true);

        // First delete all MongoDB data via backend API
        const mongoResponse = await fetch("/api/projects/delete-all", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session_id: projectIdToDelete }),
        });

        const result = await mongoResponse.json();
        if (!mongoResponse.ok || !result.success) {
          toast.error("Failed to delete project data. Please try again.");
          return;
        }

        setIsDeletingMongoData(false);

        // Only proceed with Prisma deletion if MongoDB deletion was successful
        deleteProjectMutation.mutate({ id: projectIdToDelete });
      } catch (error) {
        toast.error("Failed to delete project data. Please try again.");
      } finally {
        setShowDeleteConfirm(false);
        setProjectToDelete(null);
        setIsDeletingMongoData(false);
      }
    };

    const cancelDeleteProject = () => {
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
    };

    return (
      <div
        className={`relative justify-start items-start flex flex-col p-2 h-screen ${isExpanded ? "w-64" : "w-20"
          }`}
      >
        <div
          className={`flex items-center p-2 rounded ${isExpanded ? "justify-center" : ""
            }`}
          data-tour="sidebar-menu"
        >
          {isExpanded ? (
            <div className="">
              <Image
                src="/cracked-ai-light-logo.png"
                style={{ width: "auto", height: "35px" }}
                alt="Cracked Logo"
                width={90}
                height={35}
                onClick={handleLogoClick}
                className="cursor-pointer"
              />
            </div>
          ) : (
            <Image
              src="/sidebar-logo.png"
              style={{ width: "auto", height: "35px" }}
              alt="Cracked Logo"
              width={50}
              height={35}
              className="cursor-pointer"
              onClick={() => toggleMenuState?.("open")}
            />
          )}
        </div>
        <div className="flex-1 mt-2 w-full">
          {/* Top Nav */}
          {usedIn === "project" && (
            <>
              <button
                onClick={handleDevelopment}
                className={`flex items-center w-full cursor-pointer p-2 rounded-lg hover:bg-[#f1f1f1] ${isExpanded ? "p-2" : "p-3"
                  }`}
                data-tour="settings-menu"
              >
                <CalendarDays className="w-5 h-5" />
                {isExpanded && <span className="ml-4">Schedule</span>}
              </button>
            </>
          )}

          <div>
            <button
              onClick={handleProjectsOpen}
              className={`flex items-center justify-between w-full cursor-pointer ${isExpanded ? "p-2" : "p-3"
                } rounded-lg hover:bg-[#f1f1f1]`}
              data-tour="chat-history"
            >
              <div
                className="flex items-center"
                onClick={() => {
                  if (!isExpanded) {
                    toggleMenuState?.("open");
                  }
                }}
              >
                <Layers className="w-5 h-5" />
                {isExpanded && <span className="ml-4">Projects</span>}
              </div>
              {isExpanded && (
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${projectsOpen ? "rotate-180" : ""
                    }`}
                />
              )}
            </button>
            {projectsOpen && isExpanded && (
              <>
                {user && (
                  <div className="px-4 py-2 h-screen">
                    <div
                      className={`${usedIn === "landingpage" ? "max-h-11/20" : "max-h-2/5"
                        } overflow-y-auto hide-scrollbar`}
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      {projectsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-4 h-4 rounded-full animate-spin bg-gradient-to-r from-purple-500 to-blue-500 p-[2px]">
                            <div className="w-full h-full rounded-full bg-white" />
                          </div>
                        </div>
                      ) : projects.length > 0 ? (
                        projects.map((project: any) => (
                          <div
                            key={project.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f1f1f1] group"
                          >
                            <Link
                              href={`/projects/${project.id}`}
                              className="flex items-center flex-1"
                            >
                              <Dock className="w-4 h-4" />
                              <span className="ml-4">{project.name}</span>
                            </Link>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              disabled={deleteProjectMutation.isPending}
                              className="opacity-0 cursor-pointer group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-100 rounded-md disabled:opacity-50"
                              title="Delete project"
                            >
                              {deleteProjectMutation.isPending ? (
                                <div className="w-4 h-4 rounded-full animate-spin bg-red-500" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                              )}
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">
                            No previous conversations
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Delete Confirmation Popup */}
        {showDeleteConfirm && (
          <DeleteProjectModal
            cancelDeleteProject={cancelDeleteProject}
            confirmDeleteProject={confirmDeleteProject}
            deleteProjectMutation={deleteProjectMutation}
            isDeletingMongoData={isDeletingMongoData}
          />
        )}

        <div className="absolute bg-[#ffffff] bottom-0 left-0 w-full flex flex-col px-4 py-3">
          {/* New Project Button */}
          {isExpanded && user && (
            <div className="mb-2 flex justify-start">
              <Link
                href="/"
                className="inline-block text-center py-2 px-6 text-white bg-gradient-to-r from-[#A855F7] to-[#2563EB] rounded-md hover:opacity-90 font-medium"
              >
                New Project
              </Link>
            </div>
          )}
          {/* Authentication Section */}
          {isExpanded && (
            <div className="relative bg-[#f1f1f1] my-2 text-white p-4 rounded-lg">
              <p className="font-semibold text-black">Credits Used</p>
              <div className="w-full bg-gray-600 rounded-full h-1.5 mt-2">
                <div
                  className="bg-gradient-to-r from-[#A855F7] to-[#2563EB]  h-1.5 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
              <p className="text-sm text-black">0/50</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm flex items-center text-black">
                  Rank: <Trophy size={14} className="mx-1" /> 72
                </p>
                <button
                  className="px-4 py-1.5 cursor-pointer text-sm bg-[#161519] rounded-full hover:bg-gray-600"
                  onClick={handleDevelopment}
                >
                  Upgrade
                </button>
              </div>
            </div>
          )}
          {!loading && usedIn === "project" && (
            <div className="mb-3">
              {user && (
                <>
                  {isExpanded ? (
                    <AuthenticatedMenu usedIn="sidebar" />
                  ) : (
                    <div
                      className={`flex cursor-pointer items-center rounded-lg ${isExpanded ? "p-2" : "p-1"
                        } ${isExpanded ? "justify-center" : ""} hover:bg-[#f1f1f1]`}
                    >
                      <div
                        onClick={() => toggleMenuState?.("open")}
                        className={`w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-md`}
                      >
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          <ThemeSwitch />
        </div>
      </div>
    );
  };

export default Sidebar;
