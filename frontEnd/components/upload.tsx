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
import { useSession } from "next-auth/react";

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
  onUploadSuccess: (response: string[], title: string) => void;
}

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
    if (selectedFile) {
      console.log("File type:", selectedFile.type); // Log the file type
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        alert("Please upload a valid PDF file.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("No file selected!");
      return;
    }

    if (!session?.user?.email) {
      alert("User not logged in!");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", session.user.email);

      const response = await fetch(
        "http://192.168.1.113:2500/upload/uploadAndCreateContext",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Upload failed: ${errorData.message || "Unknown error"}`);
        return;
      }

      const result: ReportResponse = await response.json();
      onUploadSuccess(result.llm.questions, result.llm.title);
      onClose();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
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
        <ModalContent>
          <ModalHeader>
            <h1 id="modal-title">Upload PDF File</h1>
          </ModalHeader>
          <ModalBody>
            <Input type="file" onChange={handleFileChange} accept=".pdf" />
          </ModalBody>
          <ModalFooter>
            <Button onPress={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button onPress={handleUpload} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
