import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/tooltip";
import { Chip } from "@nextui-org/chip";
import { Switch } from "@nextui-org/switch";
import { Slider } from "@nextui-org/slider";
import { Select, SelectItem } from "@nextui-org/select";
import ReactMarkdown from "react-markdown";
import { API_Point } from "@/APIConfig";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import { Pencil, Trash2, Download, Folder, Upload } from "lucide-react";
import { saveAs } from "file-saver";
import Loading from "./Loading";
import PDFModal from "./pdfModal";
import UploadModal from "./upload";
import ChatHeader from "./ChatModalComponents/ChatHeader";
import ChatInput from "./ChatModalComponents/ChatInput";
import FileList from "./ChatModalComponents/FileList";
import ChatMessageComp from "./ChatModalComponents/ChatMessage";
import AIReferenceModal from "./AIReferenceModal";
import ButtonVar from "./ButtonComp";
import { toast } from "react-toastify";

type AIReply = {
  reply: string;
  actionRequired?: {
    moreContext?: string;
  };
  references: References[];
  suggestedQueries: string[];
};
type MessageSender = "ai" | "user";

interface ChatHistoryMessage {
  text: string;
  sender: MessageSender;
}

interface ChatHistoryData {
  chatHistory: ChatHistoryMessage[];
  fileName: string;
  title: string;
  contextWindow: number;
  llmModel: string;
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "ai";
  references?: References[];
  isEdited?: boolean;
}
export type References = {
  filename: string;
  page: number;
  comment: string;
};

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSuggestedQueries?: string[];
  title?: string;
  fileName?: string;
  isNewChat?: boolean;
  initialChatHistory?: ChatMessage[];
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  initialSuggestedQueries = [],
  title = "",
  fileName = "",
  isNewChat = false,
  initialChatHistory = [
    { id: 1, text: "Hello! How can I assist you today?", sender: "ai" },
  ], // Add default value
}) => {
  const defaultTitle =
    title ||
    new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const modalTitle = isNewChat ? "New Chat" : defaultTitle;

  const { data: session } = useSession();
  const userName = session?.user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const [messages, setMessages] = useState<ChatMessage[]>(
    initialChatHistory || [
      { id: 1, text: "Hello! How can I assist you today?", sender: "ai" },
    ]
  );
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>(
    initialSuggestedQueries
  );
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isAIReferenceModalOpen, setIsAIReferenceModalOpen] = useState(false); // State to manage AIReferenceModal
  const [selectedQuestion, setSelectedQuestion] = useState<string>(""); // Hold the selected question for the references
  const [selectedAnswer, setSelectedAnswer] = useState<string>(""); // Hold the selected answer for the references

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [references, setReferences] = useState<References[]>([]);

  const [contextWindow, setContextWindow] = useState<number>(3);
  const [llmModel, setLlmModel] = useState<string>("GPT-4o-mini");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editInput, setEditInput] = useState<string>("");

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [userFiles, setUserFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const fetchUserFiles = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await axios.get(
        `${API_Point}/list-files/${session.user.email}`
      );
      setUserFiles(response.data);
    } catch (error) {
      console.error("Error fetching user files:", error);
    }
  };

  // Handle refresh click
  const handleRefreshClick = async () => {
    try {
      await fetchUserFiles();
    } finally {
      toast.success("User files refreshed successfully!");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 1,
          text: isNewChat
            ? "Hello! How can I assist you today?"
            : "Hello! I'm ready to continue our conversation about the file you've uploaded. What would you like to know?",
          sender: "ai",
        },
      ]);
      setInput("");
      setChatHistory([]);
      setSuggestedQueries(isNewChat ? [] : initialSuggestedQueries);
      setReferences([]);
      setAutoSave(true);
      setLlmModel("GPT-4o-mini");
      setContextWindow(5);

      if (isNewChat) {
        setSelectedFiles([]);
      } else if (fileName && userFiles.includes(fileName)) {
        setSelectedFiles([fileName]);
      } else {
        setSelectedFiles([]);
      }

      // Set up a timeout to fetch user files after 1 second
      const timer = setTimeout(() => {
        // Only fetch user files after 1 second
        if (session?.user?.email) {
          axios
            .get(`${API_Point}/list-files/${session.user.email}`)
            .then((response) => {
              setUserFiles(response.data);
            })
            .catch((error) => {
              console.error("Error fetching user files:", error);
            });
        }
      }, 1000); // 1000 milliseconds = 1 second

      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [isOpen, initialSuggestedQueries, fileName, session, isNewChat]); // Removed userFiles from the dependencies

  // Separate useEffect for fetching user files based on session change
  useEffect(() => {
    if (session?.user?.email) {
      axios
        .get(`${API_Point}/list-files/${session.user.email}`)
        .then((response) => {
          setUserFiles(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user files:", error);
        });
    }
  }, [session]); // This effect only runs when the session changes

  const handleFileSelect = (file: string) => {
    setSelectedFiles((prevSelected) =>
      prevSelected.includes(file)
        ? prevSelected.filter((f) => f !== file)
        : [...prevSelected, file]
    );
  };
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfFilename, setPdfFilename] = useState("");
  const [specificPage, setSpecificPage] = useState(1); // Default to page 1

  const handleUploadSuccess = (
    response: string[],
    title: string,
    fileName: string,
    processingTime: string
  ) => {
    console.log("File uploaded successfully:", fileName);
    // Refresh the file list
    if (session?.user?.email) {
      axios
        .get(`${API_Point}/list-files/${session.user.email}`)
        .then((response) => {
          setUserFiles(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user files:", error);
        });
    }
  };

  useEffect(() => {
    setSuggestedQueries(initialSuggestedQueries);
  }, [initialSuggestedQueries]);

  const updateChatFile = async () => {
    if (!autoSave) return;

    const chatData = {
      chatHistory: messages.map((msg) => ({
        text: msg.text,
        sender: msg.sender,
      })),
      fileName,
      title: defaultTitle, // Use the defaultTitle here
      contextWindow,
      llmModel,
    };

    try {
      await axios.post(`${API_Point}/files/updateChat`, {
        email: session?.user?.email,
        fname: defaultTitle, // Use the defaultTitle for the filename
        data: JSON.stringify(chatData),
      });
    } catch (error) {
      console.error("Error updating chat file:", error);
    }
  };

  const handleExportChat = () => {
    const chatContent = messages
      .map((msg) => `${msg.sender.toUpperCase()}: ${msg.text}`)
      .join("\n\n");

    const blob = new Blob([chatContent], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${defaultTitle || "chat"}_export.txt`); // Use defaultTitle here
  };

  const handleSend = async (): Promise<void> => {
    if (input.trim()) {
      const newUserMessage: ChatMessage = {
        id: messages.length + 1,
        text: input,
        sender: "user",
      };

      setMessages((prev) => [...prev, newUserMessage]);
      setInput("");
      setIsTyping(true);

      try {
        const response = await axios.post<AIReply>(
          `${API_Point}/chat/chat`,
          {
            message: input,
            history: chatHistory.slice(-contextWindow * 2),
            email: session?.user?.email,
            selectedFiles: selectedFiles,
            llmModel: llmModel,
            contextWindow: contextWindow,
          },
          { headers: { "Content-Type": "application/json" } }
        );

        const aiResponse = response.data;
        const newAIMessage: ChatMessage = {
          id: messages.length + 2,
          text: aiResponse.reply,
          sender: "ai",
          references: aiResponse.references,
        };

        setMessages((prev) => [...prev, newAIMessage]);
        setReferences(aiResponse.references);

        // Store the last question and answer for reference generation
        setSelectedQuestion(input);
        setSelectedAnswer(aiResponse.reply);

        if (aiResponse.suggestedQueries) {
          setSuggestedQueries(aiResponse.suggestedQueries);
        }

        const updatedHistory = [...chatHistory, input, aiResponse.reply];
        setChatHistory(updatedHistory);

        // Update chat file after message updates are complete
        await updateChatFile();

        setIsTyping(false);
        if (audioRef.current) {
          audioRef.current.play();
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "Error in communication with AI.",
            sender: "ai",
          },
        ]);
        setIsTyping(false);
      }
    }
  };
  const handleOpenAIReferenceModal = () => {
    setIsAIReferenceModalOpen(true);
  };

  // Update handleSaveEdit function
  const handleSaveEdit = async (id: number) => {
    if (editInput.trim()) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, text: editInput, isEdited: true } : msg
        )
      );
      setEditingMessageId(null);
      setEditInput("");

      const updatedHistory = chatHistory.map((msg, index) =>
        index === id - 1 ? editInput : msg
      );
      setChatHistory(updatedHistory);

      setIsTyping(true);
      try {
        const response = await axios.post<AIReply>(
          `${API_Point}/chat/chat`,
          {
            message: editInput,
            history: updatedHistory.slice(-contextWindow * 2),
            email: session?.user?.email,
            fileName: fileName,
            llmModel: llmModel,
          },
          { headers: { "Content-Type": "application/json" } }
        );

        const aiResponse = response.data;
        const newAIMessage: ChatMessage = {
          id: messages.length + 1,
          text: aiResponse.reply,
          sender: "ai",
          references: aiResponse.references,
        };

        setMessages((prev) => [...prev, newAIMessage]);
        setReferences(aiResponse.references);

        if (aiResponse.suggestedQueries) {
          setSuggestedQueries(aiResponse.suggestedQueries);
        }

        const finalUpdatedHistory = [...updatedHistory, aiResponse.reply];
        setChatHistory(finalUpdatedHistory);

        // Update chat file after all changes are complete
        await updateChatFile();

        setIsTyping(false);
      } catch (error) {
        console.error("Error fetching AI response after edit:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "Error in communication with AI after edit.",
            sender: "ai",
          },
        ]);
        setIsTyping(false);
      }
    }
  };

  const handleReferenceClick = (ref: References) => {
    // Set the filename and specific page from the reference
    setPdfFilename(ref.filename); // Assuming ref has a filename property
    setSpecificPage(ref.page); // Assuming ref has a page property
    setIsPdfModalOpen(true); // Open the PDF modal
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSuggestedQueryClick = (query: string) => {
    setInput(query);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEditMessage = (id: number) => {
    const messageToEdit = messages.find((msg) => msg.id === id);
    if (messageToEdit) {
      setEditingMessageId(id);
      setEditInput(messageToEdit.text);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));

    // Update chat history
    const updatedHistory = chatHistory.filter((_, index) => index !== id - 1);
    setChatHistory(updatedHistory);

    await updateChatFile();
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex justify-between items-center">
            <ChatHeader
              modalTitle={modalTitle}
              fileName={fileName}
              autoSave={autoSave}
              onAutoSaveChange={setAutoSave}
              onExport={handleExportChat}
            />
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <span>Context Window:</span>
                  <Slider
                    size="sm"
                    step={1}
                    minValue={3}
                    maxValue={15}
                    value={contextWindow}
                    onChange={(value) => setContextWindow(value as number)}
                    className="w-32"
                  />
                  <span>{contextWindow}</span>
                </div>
                <Select
                  label="LLM Model"
                  value={llmModel}
                  onChange={(e) => setLlmModel(e.target.value)}
                  size="sm"
                  className="w-48"
                >
                  <SelectItem key="GPT-4o" value="GPT-4o">
                    GPT-4o
                  </SelectItem>
                  <SelectItem key="GPT-4o-mini" value="GPT-4o-mini">
                    GPT-4o-mini
                  </SelectItem>
                </Select>
              </div>
              <div className="flex flex-grow overflow-hidden">
                <div className="w-3/4 pr-4 flex flex-col">
                  <div
                    id="chat-container"
                    ref={chatContainerRef}
                    className="flex-grow overflow-y-auto mb-4"
                    style={{ maxHeight: "calc(100vh - 300px)" }}
                  >
                    {" "}
                    {messages.map((msg) => (
                      <ChatMessageComp
                        key={msg.id}
                        message={msg}
                        userInitial={userInitial}
                        isEditing={editingMessageId === msg.id}
                        editInput={editInput}
                        onEditInputChange={(value) => setEditInput(value)}
                        onSaveEdit={() => handleSaveEdit(msg.id)}
                        onCancelEdit={() => setEditingMessageId(null)}
                        onEditClick={() => handleEditMessage(msg.id)}
                        onDeleteClick={() => handleDeleteMessage(msg.id)}
                      />
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex items-center bg-gray-200 text-black rounded-lg p-2">
                          <span className="typing-indicator"></span>
                          <Loading />
                        </div>
                      </div>
                    )}
                  </div>
                  <PDFModal
                    email={session?.user?.email || ""}
                    isOpen={isPdfModalOpen}
                    onClose={() => setIsPdfModalOpen(false)}
                    filename={pdfFilename}
                    specificPage={specificPage} // Pass the specific page number
                  />
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">References</h3>
                    {references.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {references.map((ref, index) => (
                          <Tooltip
                            key={index}
                            content={ref.comment}
                            placement="top"
                          >
                            <Button
                              size="sm"
                              variant="flat"
                              onClick={() => handleReferenceClick(ref)}
                            >
                              {ref.filename} - Page {ref.page}
                            </Button>
                          </Tooltip>
                        ))}
                      </div>
                    ) : (
                      <p>No references available.</p>
                    )}
                  </div>
                </div>
                <FileList
                  onRefreshClick={handleRefreshClick}
                  userFiles={userFiles}
                  selectedFiles={selectedFiles}
                  onFileSelect={handleFileSelect}
                  onUploadClick={() => setIsUploadModalOpen(true)}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <ChatInput
              input={input}
              suggestedQueries={suggestedQueries}
              onInputChange={handleTextareaChange}
              onKeyDown={handleTextareaKeyDown}
              onSend={handleSend}
              onSuggestedQueryClick={handleSuggestedQueryClick}
            />
            <div className="flex items-center gap-2">
              <ButtonVar
                s3
                label="Generate Generative Glance"
                onClick={handleOpenAIReferenceModal}
                disabled={!selectedQuestion.trim() || isTyping} // Disable if input is empty
              />
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
      <AIReferenceModal
        isOpen={isAIReferenceModalOpen}
        onClose={() => setIsAIReferenceModalOpen(false)}
        question={selectedQuestion}
        answer={selectedAnswer}
        email={session?.user?.email || ""}
        userFiles={selectedFiles}
      />
    </>
  );
};

export default ChatModal;
