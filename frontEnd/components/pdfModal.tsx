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
}

const PDFModal: React.FC<PDFModalProps> = ({
  isOpen,
  onClose,
  filename,
  specificPage,
}) => {
  const pdfLink = `${API_Point}/guri2022@hotmail.com/${filename}#page=${specificPage}`; // Adjust the path as needed

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalContent>
        <ModalHeader>
          <h2>{filename}</h2>
        </ModalHeader>
        <ModalBody>
          {/* Display PDF using an iframe */}
          <iframe
            src={pdfLink}
            width="100%"
            height="600px"
            style={{ border: "none" }}
            title="PDF Document"
          ></iframe>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PDFModal;
