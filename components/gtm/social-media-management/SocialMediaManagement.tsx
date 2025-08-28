import "@/app/styles/project/social-media-management.scss";
import { GalleryModal } from "@/components/gtm/content-creation/GalleryModal";
import Image from "next/image";
import { DeletePostModal } from "@/components/gtm/social-media-management/DeleteDraftModal";
import ManageIcon from "@/components/gtm/social-media-management/ManageIcon";
import PostPreviewModal from "@/components/gtm/social-media-management/PostPreviewModal";
import {
  triggerSocialMediaRefetch,
  useSocialMediaRefetch,
} from "@/hooks/useSocialMediaRefetch";
import { useTRPC } from "@/trpc/client";
import { SocialMediaPost } from "@/types/social-media";
import { useTab } from "@/utils/TabContext";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface SocialMediaManagementProps {
  projectId: string;
  searchTerm: string;
  platformFilter: string;
  statusFilter: string;
}

export const SocialMediaManagement: React.FC<SocialMediaManagementProps> = ({
  projectId,
  searchTerm,
  platformFilter,
  statusFilter,
}) => {
  const { activeTab } = useTab();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [postDetails, setPostDetails] = useState<SocialMediaPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Use the custom hook instead of managing state manually
  const { posts, loading, error, refetch } = useSocialMediaRefetch(projectId);
  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );
  const { prompt: initialPrompt } = project;

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      Scheduled: "status-scheduled",
      Published: "status-published",
      Draft: "status-draft",
    };
    return statusClasses[status as keyof typeof statusClasses] || "";
  };

  // Filter posts based on search and filters
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPlatform =
      platformFilter === "All Platforms" ||
      post.platform?.toLowerCase() === platformFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "All Status" || post.status === statusFilter;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const handlePostDelete = async () => {
    try {
      const response = await fetch(`/api/draft/delete-draft`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postDetails?.id,
          project_id: projectId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      } else {
        toast.success("Post deleted successfully");
      }
      // Refetch posts after deletion
      triggerSocialMediaRefetch();
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setShowDeleteConfirm(false);
      setPostDetails(null);
    }
  };

  const handlePreview = (post: SocialMediaPost) => {
    setPostDetails(post);
    setShowPreview(true);
  };

  const showDeleteConfirmation = (post: SocialMediaPost) => {
    setPostDetails(post);
    setShowDeleteConfirm(true);
  };

  const cancelDeletion = () => {
    setShowDeleteConfirm(false);
    setPostDetails(null);
  };

  const handleGalleryModal = (post: SocialMediaPost) => {
    setPostDetails(post);
    setIsModalOpen(true);
  };

  if (activeTab !== "social-media-management") {
    return null;
  }

  return (
    <div className="social-media-management">
      <DeletePostModal
        isOpen={showDeleteConfirm}
        onClose={cancelDeletion}
        onConfirm={handlePostDelete}
      />
      <GalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoTemplate={postDetails ? { url: postDetails.links[0] } : null}
        initialPrompt={initialPrompt || null}
        projectId={projectId}
      />
      {showPreview && (
        <PostPreviewModal
          onClose={() => setShowPreview(false)}
          postDetails={postDetails}
        />
      )}
      {loading && (
        <div className="social-media-management__loading-container">
          <p>Loading posts...</p>
        </div>
      )}
      {!loading && posts.length === 0 && (
        <div className="social-media-management__empty-container">
          <p>No posts found</p>
        </div>
      )}
      {!loading && error && (
        <div
          className="error-container"
          style={{ textAlign: "center", padding: "2rem", color: "red" }}
        >
          <p>Error: {error}</p>
          <button
            onClick={refetch}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}
      {!loading && !error && posts.length > 0 && (
        <div className="social-media-management__container">
          <div className="social-media-management__table-container mx-5">
            <table className="social-media-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Platform</th>
                  <th>Schedule Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ textAlign: "center", padding: "2rem" }}
                    >
                      No posts found
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <div className="thumbnail-container">
                          {post.type === "Image" ? (
                            <div className="post-thumbnail relative overflow-hidden">
                              <Image
                                src={post.thumbnail}
                                alt={post.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <video
                              src={post.thumbnail}
                              className="post-thumbnail"
                            />
                          )}

                          {post.type === "Reel" && (
                            <span className="app-badge">APP</span>
                          )}
                        </div>
                      </td>
                      <td className="post-title">{post.title}</td>
                      <td>
                        <span
                          className={`type-badge ${post.type.toLowerCase()}`}
                        >
                          {post.type}
                        </span>
                      </td>
                      <td>
                        <div className="platforms-container">
                          <span className={`platform-icon ${post.platform}`}>
                            <ManageIcon
                              platform={post?.platform?.toLowerCase() as string}
                            />
                          </span>
                        </div>
                      </td>
                      <td className="schedule-date">{post.scheduleDate}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadge(
                            post.status
                          )}`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td>
                        <div className="actions-container">
                          <button
                            onClick={() => showDeleteConfirmation({ ...post })}
                            className="action-btn delete"
                            title="Delete post"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          {/* <button
                            onClick={() => handleGalleryModal({ ...post })}
                            className="action-btn edit"
                            title="Edit post"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button> */}
                          <button
                            onClick={() => handlePreview({ ...post })}
                            className="action-btn view"
                            title="View post"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="3"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              /* Handle download */
                            }}
                            className="action-btn download"
                            title="Download post"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <polyline
                                points="7,10 12,15 17,10"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <line
                                x1="12"
                                y1="15"
                                x2="12"
                                y2="3"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
