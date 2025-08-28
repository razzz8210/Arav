import { Trash2 } from "lucide-react";

interface DeleteProjectModalProps {
  cancelDeleteProject: () => void;
  confirmDeleteProject: () => void;
  deleteProjectMutation: { isPending: boolean };
  isDeletingMongoData: boolean;
}

export const DeleteProjectModal = ({
  cancelDeleteProject,
  confirmDeleteProject,
  deleteProjectMutation,
  isDeletingMongoData,
}: DeleteProjectModalProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl relative z-10">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Project
            </h3>
            <p className="text-sm text-gray-500">
              This action cannot be undone
            </p>
          </div>
        </div>

        <p className="text-gray-700 mb-6">
          Are you sure you want to delete this project? This will permanently
          remove:
          <br />• The project and all messages
          <br />• Marketing strategies and content
          <br />• Social media posts
          <br />• Reels and Carousels
          <br />• All other project-related data
          <br />
          <br />
          This action cannot be undone.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={cancelDeleteProject}
            className="flex-1 px-4 py-2 cursor-pointer text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmDeleteProject}
            disabled={deleteProjectMutation.isPending || isDeletingMongoData}
            className="flex-1 px-4 py-2 cursor-pointer text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-md transition-colors flex items-center justify-center"
          >
            {isDeletingMongoData || deleteProjectMutation.isPending ? (
              <>
                <div className="w-4 h-4 rounded-full animate-spin bg-white mr-2" />
                Deleting...
              </>
            ) : (
              "Delete Project"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
