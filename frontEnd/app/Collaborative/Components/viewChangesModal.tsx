import React, { useState, useEffect } from "react";
import { SearchIcon, FileIcon, PlusIcon, MinusIcon } from "lucide-react";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Chip } from "@nextui-org/chip";

import Loading from "@/components/Loading";

interface FileChange {
  filename: string;
  status: "modified" | "added" | "deleted";
  additions: number;
  deletions: number;
  changes: number;
  patch: string;
}

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  filesChanged: FileChange[];
}

interface ViewChangesModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  commitId: string;
}

const ViewChangesModal: React.FC<ViewChangesModalProps> = ({
  visible,
  setVisible,
  commitId,
}) => {
  const [commitDetails, setCommitDetails] = useState<Commit | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (visible && commitId) {
      fetchCommitDetails();
    }
  }, [visible, commitId]);

  const fetchCommitDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:2500/collab/commits/${commitId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch commit details");
      }
      const data: Commit = await response.json();

      setCommitDetails(data);
    } catch (error) {
      console.error("Failed to fetch commit details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFiles =
    commitDetails?.filesChanged.filter((file) =>
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const renderFileStatus = (status: string) => {
    switch (status) {
      case "added":
        return <Chip color="success">Added</Chip>;
      case "deleted":
        return <Chip color="danger">Deleted</Chip>;
      case "modified":
        return <Chip color="warning">Modified</Chip>;
      default:
        return <Chip>{status}</Chip>;
    }
  };

  return (
    <Modal
      isOpen={visible}
      scrollBehavior="inside"
      size="5xl"
      onClose={() => setVisible(false)}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              View Changes for Commit: {commitId}
            </ModalHeader>
            <ModalBody>
              <Input
                placeholder="Search files..."
                startContent={<SearchIcon />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Divider className="my-4" />
              {isLoading ? (
                <Loading />
              ) : commitDetails ? (
                <div>
                  <h3 className="font-bold">Commit: {commitDetails.sha}</h3>
                  <p>Author: {commitDetails.author}</p>
                  <p>Date: {new Date(commitDetails.date).toLocaleString()}</p>
                  <p>Message: {commitDetails.message}</p>
                  <Divider className="my-4" />
                  <h4 className="font-bold mb-2">Files Changed:</h4>
                  <Accordion>
                    {filteredFiles.map((file, index) => (
                      <AccordionItem
                        key={file.filename}
                        aria-label={file.filename}
                        title={
                          <div className="flex items-center gap-2 bg">
                            <FileIcon />
                            {file.filename} {renderFileStatus(file.status)}
                          </div>
                        }
                      >
                        <div className=" p-2 rounded">
                          <p>
                            <PlusIcon className="inline text-success mr-1" />
                            {file.additions} additions,
                            <MinusIcon className="inline text-danger mx-1" />
                            {file.deletions} deletions
                          </p>
                          <pre className="whitespace-pre-wrap text-sm mt-2 overflow-x-auto">
                            {file.patch}
                          </pre>
                        </div>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ) : (
                <p>No commit details available</p>
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
  );
};

export default ViewChangesModal;
