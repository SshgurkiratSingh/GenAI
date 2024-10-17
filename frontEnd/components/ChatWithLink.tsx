// ChatURLModal.tsx or ChatURLModal.jsx
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { useState, ChangeEvent } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import axios from "axios";
import { API_Point } from "@/APIConfig"; // Adjust this import according to your project structure
import ReactMarkdown from 'react-markdown'; // Import the Markdown parser

interface ChatURLModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatURLModal: React.FC<ChatURLModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleQuestionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuestion(event.target.value);
  };

  const handleSubmit = async () => {
    if (url.trim() && question.trim()) {
      setLoading(true);
      try {
        const response = await axios.post(`${API_Point}/url/ask-from-url`, {
          url,
          question,
        });
        setAnswer(response.data.answer);
      } catch (error) {
        console.error("Error:", error);
        setAnswer("An error occurred while processing your request.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please enter both a valid URL and a question.");
    }
  };

  return (
    <Modal
      closeButton
      aria-labelledby="modal-title"
      isOpen={isOpen}
      onOpenChange={onClose}
    >
      <ModalContent>
        <ModalHeader>
          <h1 id="modal-title">Chat with Link</h1>
        </ModalHeader>
        <ModalBody>
          <Input
            placeholder="Enter URL"
            value={url}
            onChange={handleUrlChange}
          />
          <Input
            placeholder="Ask a question"
            value={question}
            onChange={handleQuestionChange}
          />
          {loading && <p>Loading...</p>}
          {answer && (
            <div>
              <p>Answer:</p>
              <ReactMarkdown>{answer}</ReactMarkdown> {/* Render answer as Markdown */}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            Submit
          </Button>
          <Button color="secondary" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ChatURLModal;
