import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { Pencil, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatMessage } from "../ChatModal";

interface ChatMessageProps {
  message: ChatMessage;
  userInitial: string;
  isEditing: boolean;
  editInput: string;
  onEditInputChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const ChatMessageComp = ({
  message,
  userInitial,
  isEditing,
  editInput,
  onEditInputChange,
  onSaveEdit,
  onCancelEdit,
  onEditClick,
  onDeleteClick,
}: ChatMessageProps) => {
  return (
    <div
      className={`flex mb-4 ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex items-start ${
          message.sender === "user" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`${
            message.sender === "user"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-black"
          } rounded-full w-8 h-8 flex items-center justify-center font-bold`}
        >
          {message.sender === "user" ? userInitial : "A"}
        </div>
        <div
          className={`mx-2 p-2 rounded-lg ${
            message.sender === "user"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          {isEditing ? (
            <div>
              <textarea
                value={editInput}
                onChange={(e) => onEditInputChange(e.target.value)}
                className="w-full p-2 border rounded resize-none"
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <Button size="sm" color="primary" onClick={onSaveEdit}>
                  Save
                </Button>
                <Button
                  size="sm"
                  color="secondary"
                  onClick={onCancelEdit}
                  className="ml-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {message.sender === "ai" ? (
                <ReactMarkdown>{message.text}</ReactMarkdown>
              ) : (
                message.text
              )}
              {message.isEdited && (
                <span className="text-xs italic ml-2">(edited)</span>
              )}
            </div>
          )}
        </div>
        {message.sender === "user" && !isEditing && (
          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" variant="light">
                •••
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Message actions">
              <DropdownItem
                key="edit"
                startContent={<Pencil size={16} />}
                onClick={onEditClick}
              >
                Edit
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<Trash2 size={16} />}
                onClick={onDeleteClick}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
    </div>
  );
};
export default ChatMessageComp;
