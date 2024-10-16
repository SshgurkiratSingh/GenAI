import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
interface LLM {
  questions: string[];
  title: string;
}

interface ReportResponse {
  message: string;
  llm: LLM;
  processingTime: string; // or number if you want to represent it in ms
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (response: string[]) => void;
}

import { useSession } from "next-auth/react";

export default function UploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { data: session } = useSession();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleUpload = async () => {
    if (file && session?.user?.email) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("email", session.user.email);

        const response = await fetch(
          "http://localhost:2500/uploadFileandGatherContext",
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          const result: ReportResponse = await response.json();
          onUploadSuccess(result.llm.questions);
          onClose();
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file. Please try again.");
      } finally {
        setIsUploading(false);
      }
    } else {
      alert(file ? "User not logged in!" : "No file selected!");
    }
  };

  return (
    <>
      <Modal
        closeButton
        aria-labelledby="modal-title"
        isOpen={isOpen}
        onOpenChange={onClose}
      >
        {" "}
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h1 id="modal-title">Upload PDF File</h1>
              </ModalHeader>
              <ModalBody>
                <Input type="file" onChange={handleFileChange} accept=".pdf" />
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>Cancel</Button>
                <Button onPress={handleUpload}>Upload</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
