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
import { API_Point } from "@/APIConfig";

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
  const [references, setReferences] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      generateReferences();
    }
  }, [isOpen]);

  const generateReferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_Point}/chat/generate-references`,
        {
          question,
          answer,
          email,
          userFiles,
        }
      );
      setReferences(response.data.references);
    } catch (error) {
      console.error("Error generating references:", error);
      setError("Failed to generate references. Please try again.");
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
                {loading ? (
                  <div className="flex justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : error ? (
                  <div className="text-red-600">{error}</div>
                ) : references ? (
                  <div className="space-y-4">
                    {references.split("\n").map((reference, index) => (
                      <Card key={index}>
                        <CardBody>{reference}</CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div>No references available.</div>
                )}
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
