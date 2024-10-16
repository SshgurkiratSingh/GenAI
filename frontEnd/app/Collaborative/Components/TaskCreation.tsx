import React, { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { Divider } from "@nextui-org/divider";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Chip } from "@nextui-org/chip";
import { Select, SelectItem } from "@nextui-org/select";
import { Checkbox } from "@nextui-org/checkbox";
import { toast } from "react-toastify";

import { API_Point } from "@/APIConfig";

// TypeScript types
export type Task = {
  id: string;
  assignee: string;
  assigner: string;
  task: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

interface TaskAssignedCardProps {
  currentLoggedInUser: string;
}

const users: string[] = [
  "Jayant-0101",
  "sshGurkiratSingh",
  "JaiAditya",
  "codersam108",
  "mrdihul",
  "GenAI",
];

export default function TaskAssignedCard({
  currentLoggedInUser,
}: TaskAssignedCardProps): React.JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    assigner: currentLoggedInUser,
    status: "Pending",
  });
  const [selectedTask, setSelectedTask] = useState<Partial<Task> | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(users);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const tasksPerPage = 3;

  // Modal control hooks
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    // Fetch tasks from the backend
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${API_Point}/collab/tasks`);

        if (!response.ok) throw new Error("Error fetching tasks");

        const data: Task[] = await response.json();

        setTasks(data);
        setFilteredTasks(data);
      } catch (error) {
        toast.error("Error fetching tasks");
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    // Filter tasks based on selected users
    const filtered = tasks.filter((task) =>
      selectedUsers.includes(task.assignee)
    );
    setFilteredTasks(filtered);
    setCurrentPage(0); // Reset to first page when filters change
  }, [selectedUsers, tasks]);

  // Get current tasks
  const getCurrentTasks = () => {
    const startIndex = currentPage * tasksPerPage;
    return filteredTasks.slice(startIndex, startIndex + tasksPerPage);
  };

  // Handle creating new task
  const handleCreateTask = async () => {
    try {
      const response = await fetch(`${API_Point}/collab/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) throw new Error("Error creating task");

      const data: Task = await response.json();

      setTasks((prev) => [...prev, data]);
      toast.success("Task created successfully!");
      setIsCreateModalOpen(false);
      setNewTask({ assigner: currentLoggedInUser, status: "Pending" });
    } catch (error) {
      toast.error("Error creating task");
    }
  };

  // Handle updating selected task
  const handleUpdateTask = async () => {
    if (!selectedTask?.id) return;

    try {
      const response = await fetch(
        `${API_Point}/collab/tasks/${selectedTask.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedTask),
        }
      );

      if (!response.ok) throw new Error("Error updating task");

      const updatedTask: Task = await response.json();

      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      toast.success("Task updated successfully!");
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error("Error updating task");
    }
  };

  // Handle deleting task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`${API_Point}/collab/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error deleting task");

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      toast.success("Task deleted successfully!");
    } catch (error) {
      toast.error("Error deleting task");
    }
  };

  // Handle input changes for new task or selected task
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>,
    key: keyof Task
  ) => {
    if (isCreateModalOpen) {
      setNewTask((prev) => ({ ...prev, [key]: e.target.value }));
    } else if (isEditModalOpen && selectedTask) {
      setSelectedTask((prev) => ({ ...prev, [key]: e.target.value }));
    }
  };

  // Handle user selection for filtering
  const handleUserSelection = (user: string) => {
    setSelectedUsers((prev) =>
      prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user]
    );
  };

  return (
    <div className="max-w-[500px]">
      <Card className="min-w-96">
        <CardHeader>
          <div className="flex justify-between w-full">
            <h2>Task Assigned</h2>
            <Button
              color="primary"
              onPress={() => {
                setIsCreateModalOpen(true);
              }}
            >
              Create Task
            </Button>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          {getCurrentTasks().length > 0 ? (
            <Accordion isCompact className="flex flex-col gap-1">
              {getCurrentTasks().map((task) => (
                <AccordionItem
                  key={task.id}
                  aria-label={`Accordion-${task.id}`}
                  title={`${task.assignee}: ${task.task}`}
                >
                  <div>
                    Status:{" "}
                    <Chip
                      color={
                        task.status.toLowerCase() === "pending"
                          ? "warning"
                          : "success"
                      }
                    >
                      {task.status}
                    </Chip>
                  </div>
                  <div>Assigned by: {task.assigner}</div>
                  <div>
                    Created: {new Date(task.createdAt).toLocaleString()}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      color="secondary"
                      onPress={() => {
                        setSelectedTask(task);
                        setIsEditModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      onPress={() => handleDeleteTask(task.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Chip color="danger">No tasks assigned</Chip>
          )}
        </CardBody>
        <Divider />
        <CardFooter>
          <div className="flex flex-col w-full gap-2">
            <div className="flex flex-wrap gap-2">
              {users.map((user) => (
                <Checkbox
                  key={user}
                  isSelected={selectedUsers.includes(user)}
                  onValueChange={() => handleUserSelection(user)}
                >
                  {user}
                </Checkbox>
              ))}
            </div>
            <div className="flex justify-between w-full mt-2">
              <Button
                color="primary"
                onPress={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                isDisabled={currentPage === 0}
              >
                Previous
              </Button>
              <Button
                color="primary"
                onPress={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      Math.ceil(filteredTasks.length / tasksPerPage) - 1,
                      prev + 1
                    )
                  )
                }
                isDisabled={
                  currentPage ===
                  Math.ceil(filteredTasks.length / tasksPerPage) - 1
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewTask({ assigner: currentLoggedInUser, status: "Pending" });
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create New Task</ModalHeader>
              <ModalBody>
                <Select
                  label="Assignee"
                  placeholder="Select assignee"
                  value={newTask.assignee}
                  onChange={(e) => handleInputChange(e, "assignee")}
                >
                  {users.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  isReadOnly
                  label="Assigner"
                  placeholder="Enter assigner"
                  value={newTask.assigner || ""}
                  onChange={(e) => handleInputChange(e, "assigner")}
                />
                <Input
                  label="Task"
                  placeholder="Enter task"
                  value={newTask.task || ""}
                  onChange={(e) => handleInputChange(e, "task")}
                />
                <Select
                  label="Status"
                  placeholder="Select status"
                  value={newTask.status}
                  onChange={(e) => handleInputChange(e, "status")}
                >
                  <SelectItem key="Pending" value="Pending">
                    Pending
                  </SelectItem>
                  <SelectItem key="Completed" value="Completed">
                    Completed
                  </SelectItem>
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={handleCreateTask}>
                  Create Task
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Task Modal */}
      {selectedTask && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Edit Task</ModalHeader>
                <ModalBody>
                  <Select
                    label="Assignee"
                    placeholder="Select assignee"
                    value={selectedTask.assignee}
                    onChange={(e) => handleInputChange(e, "assignee")}
                  >
                    {users.map((user) => (
                      <SelectItem key={user} value={user}>
                        {user}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    isReadOnly
                    label="Assigner"
                    placeholder="Enter assigner"
                    value={selectedTask.assigner || ""}
                    onChange={(e) => handleInputChange(e, "assigner")}
                  />
                  <Input
                    label="Task"
                    placeholder="Enter task"
                    value={selectedTask.task || ""}
                    onChange={(e) => handleInputChange(e, "task")}
                  />
                  <Select
                    label="Status"
                    placeholder="Select status"
                    value={selectedTask.status}
                    onChange={(e) => handleInputChange(e, "status")}
                  >
                    <SelectItem key="Pending" value="Pending">
                      Pending
                    </SelectItem>
                    <SelectItem key="Completed" value="Completed">
                      Completed
                    </SelectItem>
                  </Select>
                </ModalBody>
                <ModalFooter>
                  <Button color="secondary" onPress={handleUpdateTask}>
                    Update Task
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
