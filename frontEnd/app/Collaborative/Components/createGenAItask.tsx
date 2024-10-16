import React, { useState, useEffect, useRef } from "react";
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
import { toast } from "react-toastify";

import { API_Point } from "@/APIConfig";
import { SearchIcon } from "@/components/icons";

// Define types for the task and API response
interface Task {
  assigned: string;
  task: string;
  assignee: string;
  assigner: string;
  status: string;
}

interface ApiResponse {
  tasks: Task[];
}

interface NewTask {
  assignee: string;
  assigner: string;
  task: string;
  status: string;
}

export default function GenAITaskCreation({
  setVisible,
  visible,
  currentLoggedInUser,
}: {
  setVisible: (visible: boolean) => void;
  visible: boolean;
  currentLoggedInUser: string;
}) {
  const [requirements, setRequirements] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null); // Create a ref for the input field

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequirements(e.target.value);
  };

  const generateTasks = async () => {
    if (!requirements) {
      setError("Requirements are required");

      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_Point}/collab/generate-tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requirements }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate tasks");
      }

      const data: ApiResponse = await response.json();

      setTasks(data.tasks);
    } catch (error) {
      console.error("Error generating tasks:", error);
      setError("Failed to generate tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (task: Task) => {
    const newTask: NewTask = {
      assignee: task.assigned,
      assigner: currentLoggedInUser,
      task: task.task,
      status: "Pending",
    };

    try {
      const response = await fetch(`${API_Point}/collab/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) throw new Error("Error creating task");

      const data: Task = await response.json();

      setTasks((prev) => prev.filter((t) => t.task !== task.task));
      toast.success("Task created successfully!");
    } catch (error) {
      toast.error("Error creating task");
    }
  };

  // Focus the input field when the modal is opened
  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  // Handle Enter key press to generate tasks
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      generateTasks();
    }
  };

  return (
    <Modal
      backdrop="blur"
      className="bg-transparent border-none"
      isOpen={visible}
      scrollBehavior={"inside"}
      onOpenChange={setVisible}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              Create GenAI tasks
            </ModalHeader>
            <ModalBody className="flex flex-col gap-1 text-center items-center">
              <Input
                ref={inputRef} // Attach the ref to the input
                isRequired
                className="max-w-xs"
                placeholder="Enter task requirements"
                startContent={
                  <SearchIcon color="currentColor" height={20} width={20} />
                }
                value={requirements}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown} // Add key down handler
              />
              {error && <p className="text-red-500">{error}</p>}
              <Divider />
              {tasks.length > 0 && (
                <div className="w-full text-left">
                  <h3 className="font-bold mb-2">Generated Tasks:</h3>
                  <ul className="list-disc pl-5">
                    {tasks.map((task, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center mb-2"
                      >
                        <span>
                          <strong>{task.assigned}:</strong> {task.task}
                        </span>
                        <Button
                          color="primary"
                          size="sm"
                          onPress={() => handleCreateTask(task)}
                        >
                          Create
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="flex flex-row gap-1 items-center justify-center">
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                isLoading={isLoading}
                onPress={generateTasks}
              >
                {isLoading ? "Generating..." : "Generate Tasks"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
