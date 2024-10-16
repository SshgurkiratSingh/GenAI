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
import { Input } from "@nextui-org/input";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Avatar } from "@nextui-org/avatar";
import { Tooltip } from "@nextui-org/tooltip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "ai";
}

type ActionRequired = {
  moreContext?: string;
  createTask?: {
    title: string;
    description: string;
  };
  linkButton?: {
    text: string;
    url: string;
  };
  updateTask?: {
    taskId: string;
    changes: {
      title?: string;
      description?: string;
      status?: string;
      assignee?: string;
    };
  };
  deleteTask?: {
    taskId: string;
    reason: string;
  };
  viewDiff?: {
    commitSha: string;
    filePath: string;
  };
};

type AIResponse = {
  reply: string; // Must be in Markdown
  actionRequired?: ActionRequired;
  suggestedQueries?: string[];
};

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AIPersonality = "Helpful" | "Project Manager" | "Task Creator";

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hello! How can I assist you today?", sender: "ai" },
  ]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [aiPersonality, setAiPersonality] = useState<AIPersonality>("Helpful");
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSend = async (): Promise<void> => {
    if (input.trim()) {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text: input, sender: "user" },
      ]);
      setInput("");
      setIsTyping(true);

      try {
        const response = await axios.post<{ result: AIResponse }>(
          "http://localhost:2500/collab/chat",
          {
            input: input,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const aiResponse = response.data.result;

        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, text: aiResponse.reply, sender: "ai" },
        ]);

        if (aiResponse.suggestedQueries) {
          setSuggestedQueries(aiResponse.suggestedQueries);
        }

        if (aiResponse.actionRequired) {
          // Handle action required (you can implement this based on your needs)
          console.log("Action required:", aiResponse.actionRequired);
        }

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

  const handleClearChat = (): void => {
    setMessages([]);
    setSuggestedQueries([]);
  };

  const handleCopyMessage = (text: string): void => {
    navigator.clipboard.writeText(text);
  };

  const handleExportChat = (): void => {
    const chatContent = messages
      .map((msg) => `${msg.sender}: ${msg.text}`)
      .join("\n");
    const blob = new Blob([chatContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat_history.txt";
    a.click();
  };

  useEffect(() => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex justify-between items-center">
          <span>Chat with AI Assistant</span>
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button>{aiPersonality} AI</Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="AI Personality"
                onAction={(key) => setAiPersonality(key as AIPersonality)}
              >
                <DropdownItem key="Helpful">Helpful AI</DropdownItem>
                <DropdownItem key="Project Manager">
                  Project Manager
                </DropdownItem>
                <DropdownItem key="Task Creator">Task Creator</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button color="primary" onClick={handleExportChat}>
              Export Chat
            </Button>
            <Button color="danger" onClick={handleClearChat}>
              Clear Chat
            </Button>
          </div>
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
                  <Avatar
                    src={
                      msg.sender === "user"
                        ? "https://i.pravatar.cc/150?u=a042581f4e29026704d"
                        : "https://i.pravatar.cc/150?u=a042581f4e29026704e"
                    }
                    size="sm"
                    color={msg.sender === "user" ? "primary" : "secondary"}
                  />
                  <Tooltip content="Click to copy" placement="bottom">
                    <div
                      onClick={() => handleCopyMessage(msg.text)}
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
          </ScrollShadow>
        </ModalBody>
        <ModalFooter>
          <div className="w-full flex flex-col">
            <Input
              fullWidth
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
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
