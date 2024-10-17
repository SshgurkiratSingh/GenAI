import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { useState, ChangeEvent } from "react";
import { Input, Button } from "@nextui-org/react"; 

interface ChatURLModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

const ChatURLModal: React.FC<ChatURLModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [url, setUrl] = useState<string>("");

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleSubmit = () => {
    if (url.trim()) {
      onSubmit(url); 
      onClose(); 
    } else {
      alert("Please enter a valid URL.");
    }
  };

  return (
    <Modal
      closeButton
      aria-labelledby="modal-title"
      isOpen={isOpen}
      onOpenChange={onClose} // Ensure it correctly handles the modal state
    >
      <ModalContent>
        <ModalHeader>
          <h1 id="modal-title">Chat with Link</h1>
        </ModalHeader>
        <ModalBody>
          <Input
            placeholder="Enter URL"
            value={url}
            onChange={handleInputChange}
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSubmit}>Submit</Button>
          <Button color="secondary" onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ChatURLModal;
