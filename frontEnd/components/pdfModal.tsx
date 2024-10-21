"use client";
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";

interface PDFModalProps {
  link: string; // Keep the link prop
  comment: string; // Keep the comment prop
  page: number; // Keep the page prop
}

const PDFModal = ({ link, comment, page }: PDFModalProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button onPress={onOpen}>Open Modal</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Information
              </ModalHeader>
              <ModalBody>
                {/* Displaying Comment */}
                <p>{comment}</p>
                {/* You can choose to display the link and page info if needed */}
                <p>Link: {link}</p>
                <p>Page: {page}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default PDFModal;
