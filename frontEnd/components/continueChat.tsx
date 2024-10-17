import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Tooltip } from "@nextui-org/tooltip";
import { Input } from "@nextui-org/input";
import ReactMarkdown from "react-markdown";

// Define the structure for a single chat message
interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "ai";
}

// Define the structure for the chat history storage
interface ChatHistoryStore {
  chatHistory: string[]; // array of alternating user/ai responses
  fileName: string;
  title: string;
}

// Define the structure for the API response
interface ChatApiResponse {
  message: string;
  data: string; // JSON string containing ChatHistoryStore
}

// Define the structure for the AI's structured reply
interface AiReply {
  reply: string;
  actionRequired: Record<string, unknown>; // Could be more specific based on your needs
  references: string[];
  suggestedQueries: string[];
}

// Define the props for ContinueChat component
interface ContinueChatProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  fileName: string;
}

const ContinueChat: React.FC<ContinueChatProps> = ({
  isOpen,
  onClose,
  email,
  fileName,
}) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<AiReply | null>(null); // State for AI response
  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch the chat history when the modal is open or email/fileName changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.post<ChatApiResponse>(
          "http://192.168.100.113:2500/files/chat",
          { email, fname: fileName }
        );

        // Parse the JSON string in the data field
        const parsedData: ChatHistoryStore = JSON.parse(response.data.data);

        // Map the fetched history to align with ChatModal format
        const mappedChatHistory: ChatMessage[] = parsedData.chatHistory.map(
          (message, index) => ({
            id: index + 1,
            text: message,
            sender: index % 2 === 0 ? "user" : "ai", // Ensure sender is either "user" or "ai"
          })
        );

        // Update the chat history and title state
        setChatHistory(mappedChatHistory);
        setTitle(parsedData.title);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen, email, fileName]);

  // Play notification sound and auto-scroll when a new message is added
  useEffect(() => {
    const chatContainer = document.getElementById("continue-chat-container");

    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    if (newMessage && audioRef.current) {
      audioRef.current.play();
    }
    setNewMessage(false); // Reset after playing sound
  }, [chatHistory, newMessage]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newUserMessage: ChatMessage = {
      id: chatHistory.length + 1,
      text: userInput,
      sender: "user",
    };

    setChatHistory((prev) => [...prev, newUserMessage]);
    setUserInput("");
    setSending(true);

    try {
      const response = await axios.post<ChatApiResponse>(
        "http://192.168.100.113:2500/chat/chat",
        {
          message: userInput,
          history: chatHistory.map((msg) => msg.text),
          email: email,
          fileName: fileName,
        }
      );

      const aiResponseData: AiReply = JSON.parse(response.data.message); // Assuming the AI response is in the new structure
      setAiResponse(aiResponseData); // Store AI response in state

      const aiMessage: ChatMessage = {
        id: chatHistory.length + 2,
        text: aiResponseData.reply, // Use the reply field for the AI message text
        sender: "ai",
      };

      setChatHistory((prev) => [...prev, aiMessage]);
      setNewMessage(true);
    } catch (error) {
      console.error("Error sending message:", error);
      // Add an error message to the chat
      setChatHistory((prev) => [
        ...prev,
        {
          id: chatHistory.length + 2,
          text: "Error: Failed to send message. Please try again.",
          sender: "ai",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-between items-center">
                <span>{title || fileName || "Continue Chat"}</span>
              </ModalHeader>
              <ModalBody>
                <ScrollShadow
                  className="h-[400px] overflow-y-auto mb-4"
                  id="continue-chat-container"
                >
                  {loading ? (
                    <div>Loading chat history...</div>
                  ) : chatHistory.length === 0 ? (
                    <div>No chat history available.</div>
                  ) : (
                    chatHistory.map((msg) => (
                      <div key={msg.id} className="mb-4">
                        <div
                          className={`flex ${
                            msg.sender === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`${
                              msg.sender === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-black"
                            } p-2 rounded-lg max-w-[70%]`}
                          >
                            {msg.sender === "user" ? (
                              <strong>User:</strong>
                            ) : (
                              <Tooltip
                                content="Click to copy"
                                placement="bottom"
                              >
                                <div
                                  onClick={() =>
                                    navigator.clipboard.writeText(msg.text)
                                  }
                                >
                                  <strong>AI:</strong>
                                </div>
                              </Tooltip>
                            )}
                            {/* Render AI response with ReactMarkdown */}
                            {msg.sender === "ai" ? (
                              <>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                {aiResponse && (
                                  <>
                                    <div className="mt-2">
                                      <strong>Action Required:</strong>{" "}
                                      <span>{JSON.stringify(aiResponse.actionRequired)}</span>
                                    </div>
                                    <div>
                                      <strong>References:</strong>
                                      <ul>
                                        {aiResponse.references.map((reference, index) => (
                                          <li key={index}>{reference}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <strong>Suggested Queries:</strong>
                                      <ul>
                                        {aiResponse.suggestedQueries.map((query, index) => (
                                          <li key={index}>{query}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </>
                                )}
                              </>
                            ) : (
                              <span>{msg.text}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollShadow>
                <div className="flex items-center space-x-2">
                  <Input
                    ref={inputRef}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleInputKeyPress}
                    placeholder="Type your message..."
                    disabled={sending}
                    fullWidth
                  />
                  <Button
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={sending || !userInput.trim()}
                  >
                    {sending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <audio ref={audioRef} src="/notification-sound.mp3" />
    </>
  );
};

export default ContinueChat;
