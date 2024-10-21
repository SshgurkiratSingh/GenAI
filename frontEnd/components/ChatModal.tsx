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
import { Accordion, AccordionItem } from "@nextui-org/accordion";
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

type AIReply = {
  reply: string;
  actionRequired?: {
    moreContext?: string;
  };
  references: References[];
  suggestedQueries: string[];
};

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "ai";
  references?: References[];
  isEdited?: boolean;
}
type References = {
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
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  initialSuggestedQueries = [],
  title = "",
  fileName = "",
  isNewChat = false,
}) => {
  const modalTitle = isNewChat ? "New Chat" : title || "Chat with AI Assistant";
  const { data: session } = useSession();
  const userName = session?.user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hello! How can I assist you today?", sender: "ai" },
  ]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>(
    initialSuggestedQueries
  );
  const audioRef = useRef<HTMLAudioElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [autoSave, setAutoSave] = useState<boolean>(false);
  const [references, setReferences] = useState<References[]>([]);

  const [contextWindow, setContextWindow] = useState<number>(3);
  const [llmModel, setLlmModel] = useState<string>("GPT-4o-mini");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editInput, setEditInput] = useState<string>("");

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [userFiles, setUserFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
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
      setAutoSave(false);
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

  const updateChatFile = async (currentMessage: string | null = null) => {
    if (!autoSave) return;

    // Prepare data for saving, including the current message if provided
    const chatData = {
      chatHistory: currentMessage
        ? [...chatHistory, currentMessage]
        : chatHistory,
      fileName,
      title,
      contextWindow,
      llmModel,
    };

    try {
      await axios.post(`${API_Point}/files/updateChat`, {
        email: session?.user?.email,
        fname: title,
        data: JSON.stringify(chatData),
      });
    } catch (error) {
      console.error("Error updating chat file:", error);
    }
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

        if (aiResponse.suggestedQueries) {
          setSuggestedQueries(aiResponse.suggestedQueries);
        }

        const updatedHistory = [...chatHistory, input, aiResponse.reply];
        setChatHistory(updatedHistory);

        // Update chat file with current user message included
        await updateChatFile(input);

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

  const handleSaveEdit = async (id: number) => {
    if (editInput.trim()) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, text: editInput, isEdited: true } : msg
        )
      );
      setEditingMessageId(null);
      setEditInput("");

      // Update chat history
      const updatedHistory = chatHistory.map((msg, index) =>
        index === id - 1 ? editInput : msg
      );
      setChatHistory(updatedHistory);

      // Refetch AI response
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

        await updateChatFile();

        setIsTyping(false);
        if (audioRef.current) {
          audioRef.current.play();
        }
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

  const handleDeleteMessage = async (id: number) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));

    // Update chat history
    const updatedHistory = chatHistory.filter((_, index) => index !== id - 1);
    setChatHistory(updatedHistory);

    await updateChatFile();
  };

  const handleExportChat = () => {
    const chatContent = messages
      .map((msg) => `${msg.sender.toUpperCase()}: ${msg.text}`)
      .join("\n\n");

    const blob = new Blob([chatContent], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${title || "chat"}_export.txt`);
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
            <span>{modalTitle}</span>
            <div className="flex items-center space-x-2">
              {fileName && (
                <Chip size="sm" color="primary">
                  {fileName}
                </Chip>
              )}
              <Switch
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                size="sm"
              >
                Auto-save
              </Switch>
              <Button size="sm" onClick={handleExportChat}>
                <Download size={16} />
                Export Chat
              </Button>
            </div>
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
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex mb-4 ${
                          msg.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex items-start ${
                            msg.sender === "user"
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >
                          {msg.sender === "user" ? (
                            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                              {userInitial}
                            </div>
                          ) : (
                            <div className="bg-gray-200 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold">
                              {"A"}
                            </div>
                          )}

                          <div
                            className={`mx-2 p-2 rounded-lg ${
                              msg.sender === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-black"
                            }`}
                          >
                            {editingMessageId === msg.id ? (
                              <div>
                                <textarea
                                  value={editInput}
                                  onChange={(e) => setEditInput(e.target.value)}
                                  className="w-full p-2 border rounded resize-none"
                                  rows={3}
                                />
                                <div className="mt-2 flex justify-end">
                                  <Button
                                    size="sm"
                                    color="primary"
                                    onClick={() => handleSaveEdit(msg.id)}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    color="secondary"
                                    onClick={() => setEditingMessageId(null)}
                                    className="ml-2"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                {msg.sender === "ai" ? (
                                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                                ) : (
                                  msg.text
                                )}
                                {msg.isEdited && (
                                  <span className="text-xs italic ml-2">
                                    (edited)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {msg.sender === "user" &&
                            editingMessageId !== msg.id && (
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
                                    onClick={() => handleEditMessage(msg.id)}
                                  >
                                    Edit
                                  </DropdownItem>
                                  <DropdownItem
                                    key="delete"
                                    className="text-danger"
                                    color="danger"
                                    startContent={<Trash2 size={16} />}
                                    onClick={() => handleDeleteMessage(msg.id)}
                                  >
                                    Delete
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            )}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex items-center bg-gray-200 text-black rounded-lg p-2">
                          <span className="typing-indicator"></span>
                          AI is typing... <Loading />
                        </div>
                      </div>
                    )}
                  </div>
                  <PDFModal
                    isOpen={isPdfModalOpen}
                    onClose={() => setIsPdfModalOpen(false)}
                    filename={pdfFilename}
                    specificPage={specificPage} // Pass the specific page number
                  />
                  <Accordion>
                    <AccordionItem
                      key="1"
                      aria-label="Accordion 1"
                      title="References"
                    >
                      {references.length > 0
                        ? references.map((ref) => (
                            <div key={ref.filename}>
                              <button
                                key={ref.page}
                                onClick={() => handleReferenceClick(ref)}
                              >
                                Open {ref.filename} - Page {ref.page}
                              </button>
                            </div>
                          ))
                        : "No references available."}
                    </AccordionItem>
                  </Accordion>
                </div>
                <div
                  className="w-1/4 border-l pl-4 overflow-y-auto"
                  style={{ maxHeight: "calc(100vh - 300px)" }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium">Your Files (Expand Context)</p>
                    <Button
                      size="sm"
                      onClick={() => setIsUploadModalOpen(true)}
                      startContent={<Upload size={16} />}
                    >
                      Upload
                    </Button>
                  </div>
                  {userFiles.map((file) => (
                    <div key={file} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file)}
                        onChange={() => handleFileSelect(file)}
                        className="mr-2"
                      />
                      <div className="flex items-center">
                        <Folder size={16} className="mr-2" /> {file}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="w-full flex flex-col">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="w-full p-2 border rounded resize-none max-h-40 overflow-hidden"
                style={{ height: "auto" }}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-500 text-sm">
                  Press Enter to send, Shift+Enter for a new line.
                </span>
                <Button
                  color="primary"
                  onClick={handleSend}
                  disabled={!input.trim()}
                >
                  Send
                </Button>
              </div>

              {suggestedQueries.length > 0 && (
                <div className="mt-2 flex flex-wrap">
                  {suggestedQueries.map((query, idx) => (
                    <Chip
                      key={idx}
                      onClick={() => handleSuggestedQueryClick(query)}
                      className="mr-2 mb-2"
                    >
                      {query}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
};

export default ChatModal;
