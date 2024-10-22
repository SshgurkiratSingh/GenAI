import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { Card, CardBody } from "@nextui-org/card";
import axios from "axios";
import PDFModal from "./pdfModal";

interface AIReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  answer: string;
  email: string;
  userFiles: string[];
}



const AIReferenceModal: React.FC<AIReferenceModalProps> = ({
  isOpen,
  onClose,
  question,
  answer,
  email,
  userFiles,
}) => {
  const [loading, setLoading] = useState(true);
  const [references, setReferences] = useState();
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      generateReferences();
    }
  }, [isOpen]);

  const generateReferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/api/generate-reference", {
        question,
        answer,
        email,
        userFiles,
      });
      setReferences(response.data.references);
      setRetryCount(0);
    } catch (error) {
      console.error("Error generating references:", error);
      setError("Failed to generate references. Please try again.");
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(generateReferences, 2000);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                AI Generated References
              </ModalHeader>
              <ModalBody>
               
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
  
    </>
  );
};

export default AIReferenceModal;