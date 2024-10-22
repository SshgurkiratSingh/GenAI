import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import axios from "axios";
import { API_Point } from "@/APIConfig";
import Loading from "./Loading";
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
  const [references, setReferences] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New state for PDF Modal
  const [isPDFModalOpen, setPDFModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [selectedPage, setSelectedPage] = useState<number>(1);

  const renderHighlightedText = (text: string) => {
    const parts = text.split(/'''(.*?)'''/);

    return parts.map((part, index) => {
      // Detect the pattern '###'
      if (part.startsWith("###")) {
        const pageMatch = part.match(/###(\d+)-/); // Extract the page number
        const fileMatch = part.match(/-(.*\.pdf)/); // Extract the file name

        const page = pageMatch ? parseInt(pageMatch[1]) : null;
        const file = fileMatch ? fileMatch[1] : null;

        if (page && file) {
          return (
            <Button variant="ghost"
              key={index}
              onClick={() => handleReferenceClick(page, file)}
              className=" text-blue-500 px-2 py-1 rounded-md"
            >
              {"Open Reference"}
            </Button>
          );
        }
      }

      // Highlight text in triple quotes
      if (index % 2 === 1) {
        return (
          <span
            key={index}
            className="inline bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded-md font-medium"
            style={{ display: "inline" }}
          >
            {part}
          </span>
        );
      }

      // Regular text, rendered inline
      return (
        <span key={index} style={{ display: "inline" }}>
          {part}
        </span>
      );
    });
  };

  const handleReferenceClick = (page: number, file: string) => {
    setSelectedFile(file);
    setSelectedPage(page);
    setPDFModalOpen(true); // Open the PDF modal
  };

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
                <div className="py-4">
                  {loading ? (
                    <div className="flex justify-center items-center p-8">
                      <Loading />
                    </div>
                  ) : error ? (
                    <div className="text-red-600 p-4">{error}</div>
                  ) : references ? (
                    <div>
                      {references.split("\n").map((reference, index) => (
                        <span key={index} className="inline-block">
                          {renderHighlightedText(reference)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      No references available.
                    </div>
                  )}
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

      {/* Render the PDFModal */}
      <PDFModal
        isOpen={isPDFModalOpen}
        onClose={() => setPDFModalOpen(false)}
        filename={selectedFile}
        specificPage={selectedPage}
        email={email}
      />
    </>
  );
};

export default AIReferenceModal;
