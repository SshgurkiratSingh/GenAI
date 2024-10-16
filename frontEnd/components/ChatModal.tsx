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
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Tooltip } from "@nextui-org/tooltip";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "ai";
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSuggestedQueries?: string[];
  title?: string;
}

type AIPersonality = "Helpful" | "Project Manager" | "Task Creator";

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, initialSuggestedQueries = [], title = '' }) => {
  const { data: session } = useSession(); // Fetch user session
  const userName = session?.user?.name || "User"; // Extract user's name from session
  const userInitial = userName.charAt(0).toUpperCase(); // Get the first letter of user's name

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hello! How can I assist you today?", sender: "ai" },
  ]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>(initialSuggestedQueries);
  const audioRef = useRef<HTMLAudioElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Reference to the textarea

  useEffect(() => {
    setSuggestedQueries(initialSuggestedQueries);
  }, [initialSuggestedQueries]);

  const handleSend = async (): Promise<void> => {
    if (input.trim()) {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text: input, sender: "user" },
      ]);
      setInput("");
      setIsTyping(true);

      try {
        const response = await axios.post<{ result: any }>(
          "http://localhost:2500/collab/chat",
          { input },
          { headers: { "Content-Type": "application/json" } }
        );
        const aiResponse = response.data.result;

        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, text: aiResponse.reply, sender: "ai" },
        ]);

        if (aiResponse.suggestedQueries) {
          setSuggestedQueries(aiResponse.suggestedQueries);
        }

        setIsTyping(false);
        if (audioRef.current) {
          audioRef.current.play();
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, text: "Error in communication with AI.", sender: "ai" },
        ]);
        setIsTyping(false);
      }
    }
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Message copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy message: ", error);
      alert("Failed to copy message.");
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset the height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set the new height based on scrollHeight
    }
  };

  useEffect(() => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex justify-between items-center">
          <span>Chat with AI Assistant</span>
        </ModalHeader>
        <ModalBody>
          <ScrollShadow className="h-[400px]" id="chat-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex mb-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-start ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.sender === "user" ? (
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      {userInitial}
                    </div>
                  ) : (
                    <div className="bg-gray-200 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      {"A"} {/* AI's initial */}
                    </div>
                  )}

                  <Tooltip content="Click to copy" placement="bottom">
                    <div
                      onClick={() => handleCopyMessage(msg.text)}
                      className={`mx-2 p-2 rounded-lg cursor-pointer ${
                        msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                      }`}
                    >
                      {msg.sender === "ai" ? (
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </Tooltip>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center bg-gray-200 text-black rounded-lg p-2">
                  <span className="typing-indicator"></span>
                  AI is typing...
                </div>
              </div>
            )}
          </ScrollShadow>
        </ModalBody>
        <ModalFooter>
          <div className="w-full flex flex-col">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              placeholder="Type your message..."
              rows={1}
              className="w-full p-2 border rounded resize-none max-h-40 overflow-hidden" // Custom styling to disable resize and limit max height
              style={{ height: "auto" }} // Make sure height is auto initially
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">Max 500 characters.</span>
              <Button color="primary" onClick={handleSend}>
                Send
              </Button>
            </div>
            {suggestedQueries.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-semibold">Suggested queries:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {suggestedQueries.map((query, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="flat"
                      onClick={() => setInput(query)}
                    >
                      {query}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
      <audio ref={audioRef} src="/ding.mp3" preload="auto" />
    </Modal>
  );
};

export default ChatModal;
