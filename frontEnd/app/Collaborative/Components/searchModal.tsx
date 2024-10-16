"use client";
import { useState, useEffect, useRef } from "react";
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

import { CommitLogEntry } from "../page";

import { SearchIcon } from "@/components/icons";

// Helper function to highlight matched string
const highlightMatch = (text: string, query: string) => {
  if (!query) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={index} style={{ backgroundColor: "yellow" }}>
        {part}
      </span>
    ) : (
      part
    ),
  );
};

export default function SearchModal({
  setVisible,
  visible,
  taskHistory,
}: {
  setVisible: (visible: boolean) => void;
  visible: boolean;
  taskHistory: CommitLogEntry[];
}) {
  const [searchQuery, setSearchQuery] = useState(""); // State to track search input
  const [filteredResults, setFilteredResults] = useState<CommitLogEntry[]>([]); // State for search results
  const inputRef = useRef<HTMLInputElement>(null); // Create a ref for the input field

  // Handle search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;

    setSearchQuery(query);

    // Filter task history based on the search query
    if (query.trim() !== "") {
      const results = taskHistory.filter(
        (task) =>
          task.user.toLowerCase().includes(query.toLowerCase()) ||
          task.comment.toLowerCase().includes(query.toLowerCase()) ||
          task.codeChanged.toLowerCase().includes(query.toLowerCase()) ||
          task.generatedSummary.toLowerCase().includes(query.toLowerCase()),
      );

      setFilteredResults(results);
    } else {
      setFilteredResults([]);
    }
  };

  // Clear search and focus input when the modal is visible
  useEffect(() => {
    if (visible) {
      setSearchQuery("");
      setFilteredResults([]);
      if (inputRef.current) {
        inputRef.current.focus(); // Focus the input when the modal opens
      }
    }
  }, [visible]);

  return (
    <Modal
      backdrop="blur"
      className="bg-transparent border-none "
      isOpen={visible}
      scrollBehavior={"outside"}
      onOpenChange={setVisible}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              Search History Logs, Assignments and Changes
            </ModalHeader>
            <ModalBody className="flex flex-col gap-1 text-center items-center ">
              <Input
                ref={inputRef} // Attach the ref to the input field
                isRequired
                className="max-w-xs"
                placeholder="Search by user, comment, or code change"
                startContent={
                  <SearchIcon color="currentColor" height={20} width={20} />
                }
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <Divider />

              {/* Display search results */}
              <div className="flex flex-col gap-2">
                {filteredResults.length > 0 ? (
                  filteredResults.map((task) => (
                    <div key={task.id} className="p-2 border-b">
                      <div className="text-md font-semibold">
                        {highlightMatch(task.user, searchQuery)}:{" "}
                        {highlightMatch(task.comment, searchQuery)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Code Changed:{" "}
                        {highlightMatch(task.codeChanged, searchQuery)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Generated Summary:{" "}
                        {highlightMatch(task.generatedSummary, searchQuery)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(task.createdAt).toLocaleString()}
                      </div>
                      <a
                        className="text-blue-500"
                        href={task.gitCommitLink}
                        rel="noreferrer"
                        target="_blank"
                      >
                        View Commit
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-red-500">No results found</p>
                )}
              </div>

              <Divider />
            </ModalBody>
            <ModalFooter className="flex flex-row gap-1 items-center justify-center">
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
