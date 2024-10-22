import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { API_Point } from "@/APIConfig";

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string; // Pass filename to the component
  specificPage: number; // New prop for specific page
  email?: string;
}

const PDFModal: React.FC<PDFModalProps> = ({
  isOpen,
  onClose,
  filename,
  specificPage,
  email = "", // Corrected typo in email
}) => {
  const pdfLink = `${API_Point}/${email}/${filename}#page=${specificPage}`; // Adjust the path as needed

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalContent className="flex flex-col h-full">
        <ModalHeader className="flex flex-col gap-1">
          <h2>{filename}</h2>
          <p className="text-small text-default-500">Page: {specificPage}</p>
        </ModalHeader>
        <ModalBody className="flex-grow">
          {/* Display PDF using an iframe */}
          <iframe
            src={pdfLink}
            width="100%"
            height="100%" // Changed to 100% to take full height of ModalBody
            style={{ border: "none" }}
            title="PDF Document"
          ></iframe>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PDFModal;
