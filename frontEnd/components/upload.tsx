import React, { useState } from "react";
import { Button } from "@nextui-org/button";
import {  Input } from "@nextui-org/input";
import {  Modal } from "@nextui-org/modal";

const UploadPdfDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}> = ({ open, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      alert("Please upload a valid PDF file.");
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      onClose();
    } else {
      alert("No PDF selected.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} closeButton>
      <Modal.Header>
        <Text h4>Upload PDF Document</Text>
      </Modal.Header>
      <Modal.Body>
        <Text>Select a PDF document to upload</Text>
        <Input
          type="file"
          onChange={handleFileChange}
          accept="application/pdf"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button auto flat onClick={onClose} color="error">
          Cancel
        </Button>
        <Button  onClick={handleUpload}>
          Upload
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const ParentComponent: React.FC = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleUpload = (file: File) => {
    console.log("Uploaded PDF:", file);
    // Handle the uploaded PDF file here (e.g., send it to an API or store it)
  };

  return (
    <div>
      <Button onClick={() => setDialogOpen(true)}>Upload PDF</Button>
      <UploadPdfDialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default ParentComponent;