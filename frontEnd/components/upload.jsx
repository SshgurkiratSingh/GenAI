import { useState } from 'react';
import { Modal, Button, Text, Input } from '@nextui-org/react';

export default function UploadModal() {
  const [visible, setVisible] = useState(false);
  const [file, setFile] = useState(null);

  const openModal = () => setVisible(true);
  const closeModal = () => setVisible(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleUpload = () => {
    if (file) {
      // Handle the file upload logic here
      console.log("Uploading file:", file);
      closeModal();
    } else {
      alert("No file selected!");
    }
  };

  return (
    <>
      <Button auto onPress={openModal}>
        Upload PDF
      </Button>
      <Modal
        closeButton
        blur
        aria-labelledby="modal-title"
        open={visible}
        onClose={closeModal}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Upload PDF File
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Input
            type="file"
            onChange={handleFileChange}
            accept=".pdf"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onPress={closeModal}>
            Cancel
          </Button>
          <Button auto onPress={handleUpload}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}