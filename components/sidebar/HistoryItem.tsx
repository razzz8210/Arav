import { useParams } from "next/navigation";
import { classNames } from "@/app/utils/classNames";
import { type ChatHistoryItem } from "./HistoryChatItem";
import WithTooltip from "@/components/ui/Tooltip2";
import {
  forwardRef,
  type ForwardedRef,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Download, Pencil, Trash2 } from "lucide-react";

interface HistoryItemProps {
  item: ChatHistoryItem;
  onDelete?: (event: React.UIEvent) => void;
  onDuplicate?: (id: string) => void;
  exportChat: (id?: string) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
  handleDeleteChats: (id: string[]) => void;
}

export function HistoryItem({
  item,
  onDelete,
  onDuplicate,
  exportChat,
  handleDeleteChats,
  selectionMode = false,
  isSelected = false,
  onToggleSelection,
}: HistoryItemProps) {
  const { id: urlId } = useParams();
  const isActiveChat = urlId === item.urlId;

  const [editing, setEditing] = useState(false);
  const [currentDescription, setCurrentDescription] = useState(
    item.description
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDescription(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleBlur = () => {
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const toggleEditMode = () => {
    setEditing(!editing);
  };

  const handleItemClick = useCallback(
    (e: React.MouseEvent) => {
      if (selectionMode) {
        e.preventDefault();
        e.stopPropagation();
        // console.log("Item clicked in selection mode:", item.id);
        onToggleSelection?.(item.id);
      }
    },
    [selectionMode, item.id, onToggleSelection]
  );

  const handleCheckboxChange = useCallback(() => {
    // console.log("Checkbox changed for item:", item.id);
    onToggleSelection?.(item.id);
  }, [item.id, onToggleSelection]);

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      handleDeleteChats([item.id]);
      event.preventDefault();
      event.stopPropagation();
      // console.log("Delete button clicked for item:", item.id);

      if (onDelete) {
        onDelete(event as unknown as React.UIEvent);
      }
    },
    [onDelete, item.id, handleDeleteChats]
  );

  return (
    <div
      className={classNames(
        "group rounded-lg text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 overflow-hidden flex justify-between items-center px-3 py-2 transition-colors",
        {
          "text-gray-900 bg-gray-50/80": isActiveChat,
        },
        { "cursor-pointer": selectionMode }
      )}
      onClick={selectionMode ? handleItemClick : undefined}
    >
      {selectionMode && (
        <div
          className="flex items-center mr-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            id={`select-${item.id}`}
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            className="h-4 w-4"
          />
        </div>
      )}

      {editing ? (
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex items-center gap-2"
        >
          <input
            type="text"
            className="flex-1 bg-white text-gray-900 rounded-md px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            autoFocus
            value={currentDescription}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            className="i-ph:check h-4 w-4 text-gray-500 hover:text-purple-500 transition-colors"
            // onMouseDown={handleSubmit}
          />
        </form>
      ) : (
        <a
          href={`/chat/${item.urlId}`}
          className="flex w-full relative truncate block"
          onClick={selectionMode ? handleItemClick : undefined}
        >
          <WithTooltip tooltip={currentDescription}>
            <span className="truncate pr-24">{currentDescription}</span>
          </WithTooltip>
          <div
            className={classNames(
              "absolute right-0 top-0 bottom-0 flex items-center bg-transparent px-2 transition-colors"
            )}
          >
            <div className="flex items-center gap-2.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChatActionButton
                toolTipContent="Export"
                icon={<Download size={16} />}
                onClick={(event) => {
                  event.preventDefault();
                  exportChat(item.id);
                }}
              />
              {onDuplicate && (
                <ChatActionButton
                  toolTipContent="Duplicate"
                  icon={<Copy size={16} />}
                  onClick={(event) => {
                    event.preventDefault();
                    onDuplicate?.(item.id);
                  }}
                />
              )}
              <ChatActionButton
                toolTipContent="Rename"
                icon={<Pencil size={16} />}
                onClick={(event) => {
                  event.preventDefault();
                  toggleEditMode();
                }}
              />
              <ChatActionButton
                toolTipContent="Delete"
                icon={<Trash2 size={16} />}
                className="hover:text-red-500"
                onClick={handleDeleteClick}
              />
            </div>
          </div>
        </a>
      )}
    </div>
  );
}

const ChatActionButton = forwardRef(
  (
    {
      toolTipContent,
      icon,
      className,
      onClick,
    }: {
      toolTipContent: string;
      icon: ReactNode;
      className?: string;
      onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
      btnTitle?: string;
    },
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      <WithTooltip tooltip={toolTipContent} position="bottom" sideOffset={4}>
        <button
          ref={ref}
          type="button"
          className={`text-gray-400 hover:text-purple-500 transition-colors  ${
            className ? className : ""
          }`}
          onClick={onClick}
        >
          {icon}
        </button>
      </WithTooltip>
    );
  }
);
