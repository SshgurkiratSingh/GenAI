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
import ReactMarkdown from "react-markdown";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { API_Point } from "@/APIConfig";

type AIReply = {
  reply: string;
  actionRequired?: {
    moreContext?: string;
  };
  references: string;
  suggestedQueries: string[];
};

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "ai";
  references?: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSuggestedQueries?: string[];
  title?: string;
  fileName?: string;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  initialSuggestedQueries = [],
  title = "",
  fileName = "",
}) => {
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
  const [references, setReferences] = useState<string>("");

  const chatContainerRef = useRef<HTMLDivElement>(null); // Ref for the chat container

  useEffect(() => {
    setSuggestedQueries(initialSuggestedQueries);
  }, [initialSuggestedQueries]);

  const updateChatFile = async () => {
    if (!autoSave) return;

    try {
      await axios.post(`${API_Point}/files/updateChat`, {
        email: session?.user?.email,
        fname: title,
        data: JSON.stringify({
          chatHistory,
          fileName,
          title,
        }),
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
            history: chatHistory,
            email: session?.user?.email,
            fileName: fileName,
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

        // Update references
        setReferences(aiResponse.references);

        if (aiResponse.suggestedQueries) {
          setSuggestedQueries(aiResponse.suggestedQueries);
        }

        // Update chat history
        const updatedHistory = [...chatHistory, input, aiResponse.reply];
        setChatHistory(updatedHistory);

        // Update chat file
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
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSuggestedQueryClick = (query: string) => {
    setInput(query);

    // Reset textarea height
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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // Scroll to the bottom when new messages are added

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center">
          <span>{title || "Chat with AI Assistant"}</span>
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
          </div>
        </ModalHeader>
        <ModalBody>
          <div
            id="chat-container"
            ref={chatContainerRef} // Attach the ref to this container
            className="overflow-y-auto max-h-[400px]" // Adjust the height as needed
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex mb-4 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start ${
                    msg.sender === "user" ? "flex-row-reverse" : "flex-row"
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

                  <Tooltip content="Click to copy" placement="bottom">
                    <div
                      role="button" // Add a role attribute for accessibility
                      tabIndex={0} // Add tabIndex to make the element focusable
                      onClick={() => handleCopyMessage(msg.text)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCopyMessage(msg.text);
                      }} // Add keyboard support
                      className={`mx-2 p-2 rounded-lg cursor-pointer ${
                        msg.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
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
          </div>

          <Accordion>
            <AccordionItem key="1" aria-label="Accordion 1" title="References">
              {references || "No references available."}
            </AccordionItem>
          </Accordion>
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
      <audio ref={audioRef} src="/notification-sound.mp3" preload="auto">
        {/* Since captions are not needed, include aria attributes for clarity */}
        <track kind="captions" srcLang="en" label="No captions available" />
      </audio>
    </Modal>
  );
};

export default ChatModal;
