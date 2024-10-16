"use client";
import React, { useEffect, useCallback, useState } from "react";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { toast } from "react-toastify";
import { useDisclosure } from "@nextui-org/modal";
import { formatDistanceToNow } from "date-fns";
import { Chip } from "@nextui-org/chip";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Radio, RadioGroup } from "@nextui-org/radio";

import AiResultModal from "./Components/showAiGenChanges";
import ViewChangesModal from "./Components/viewChangesModal";
import TaskAssignedCard from "./Components/TaskCreation";
import SearchModal from "./Components/searchModal";
import GenAITaskCreation from "./Components/createGenAItask";
import PaginatedTaskHistory from "./Components/PaginatedTaskHistoy";

import { users } from "@/UserList";
import { API_Point } from "@/APIConfig";
import ChatModal from "@/components/ChatModal";

function extractCommitId(gitCommitLink: string): string {
  const parts = gitCommitLink.split("/");
  return parts[parts.length - 1];
}

export type Task = {
  id: string;
  assignee: string;
  assigner: string;
  task: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export interface CommitLogEntry {
  id: string;
  user: string;
  codeChanged: string;
  gitCommitLink: string;
  comment: string;
  generatedSummary: string;
  createdAt: string;
  updatedAt: string;
}

export type CommitLog = CommitLogEntry[];

export default function DocsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isViewChangesModalOpen, setIsViewChangesModalOpen] = useState(false);
  const [taskHistory, setTaskHistory] = useState<CommitLog>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [createGenAIModal, setCreateGenAIModal] = useState(false);
  const [selectedCommitId, setSelectedCommitId] = useState<string>("");
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [currentLoggedInUser, setCurrentLoggedInUser] =
    useState<string>("GenAI");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const handleViewChanges = (commitId: string) => {
    setSelectedCommitId(commitId);
    setIsViewChangesModalOpen(true);
  };

  const formatRelativeTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const handleViewAiSummary = (gitCommitLink: string, aiSummary: string) => {
    const commitId = extractCommitId(gitCommitLink);
    setAiSummary(
      aiSummary && aiSummary.length > 5 ? JSON.parse(aiSummary) : null
    );
    setSelectedCommitId(commitId);
    setAiModalVisible(true);
  };

  const handleUserChange = (value: string) => {
    setCurrentLoggedInUser(value);
  };

  const debouncedNotify = useCallback(
    debounce(() => {
      onOpen();
    }, 300),
    [onOpen]
  );

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [taskHistoryResponse, tasksResponse] = await Promise.all([
        fetch(`${API_Point}/collab/task-history`),
        fetch("http://localhost:2500/collab/tasks"),
      ]);

      if (!taskHistoryResponse.ok || !tasksResponse.ok) {
        throw new Error("Network response was not ok");
      }

      const taskHistoryData = await taskHistoryResponse.json();
      const tasksData: Task[] = await tasksResponse.json();

      setTaskHistory(taskHistoryData.reverse());
      setTasks(tasksData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === "S") {
        debouncedNotify();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [debouncedNotify]);

  return (
    <div className="flex flex-col items-center  min-w-[90%] mt-0 pt-0 h-full">
      <title>Collaborative for Hackathon</title>
      <Card fullWidth className="min-w-[1100px] w-full  mt-0 pt-0">
        <CardHeader>
          <h1>Collab</h1> <Divider orientation="vertical" /> <br />
          <Chip>
            <h2>{currentLoggedInUser}</h2>
          </Chip>
        </CardHeader>
        <Divider />
        <CardBody className="min-w-[900px]">
          <div className="flex flex-row min-w-[600px]">
            <div className="w-4/5">
              <PaginatedTaskHistory
                extractCommitId={extractCommitId}
                formatRelativeTime={formatRelativeTime}
                handleViewAiSummary={handleViewAiSummary}
                handleViewChanges={handleViewChanges}
                taskHistory={taskHistory}
              />
            </div>
            <Divider orientation="vertical" />
            <div>
              <TaskAssignedCard currentLoggedInUser={currentLoggedInUser} />
            </div>
          </div>
        </CardBody>
        <Divider />
        <CardFooter className="flex gap-4">
          <Button color="secondary" variant="ghost" onPress={debouncedNotify}>
            Search History (Shift+S)
          </Button>
          <Popover placement="right">
            <PopoverTrigger>
              <Button color="success" variant="ghost">
                Select User
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-2">
                <div className="text-small font-bold">
                  Select Logged-in User
                </div>
                <div className="flex flex-col gap-2">
                  <RadioGroup
                    color="warning"
                    label="Select User"
                    value={currentLoggedInUser}
                    onValueChange={handleUserChange}
                  >
                    {users.map((user) => (
                      <Radio key={user} value={user}>
                        {user}
                      </Radio>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            color="primary"
            variant="ghost"
            onClick={async () => {
              try {
                const response = await fetch(
                  "http://localhost:2500/collab/auto-update-task-history"
                );
                const data = await response.json();
                toast(data.message);
              } catch (error) {
                toast("Failed to update");
              }
            }}
          >
            Fetch Commits (autoFetch)
          </Button>
          <Button
            color="primary"
            variant="ghost"
            onPress={() => setCreateGenAIModal(true)}
          >
            Create GenAI Task
          </Button>
          <Button
            color="primary"
            disabled={isLoading}
            variant="ghost"
            onClick={fetchData}
          >
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </Button>
          <Button
            color="secondary"
            variant="ghost"
            onPress={() => setIsChatModalOpen(true)}
          >
            Chat with AI
          </Button>
        </CardFooter>
      </Card>
      <SearchModal
        setVisible={onClose}
        taskHistory={taskHistory}
        visible={isOpen}
      />
      <AiResultModal
        aiSummaryIfAvail={aiSummary}
        commitId={selectedCommitId}
        setVisible={setAiModalVisible}
        visible={aiModalVisible}
      />
      <ViewChangesModal
        commitId={selectedCommitId}
        setVisible={setIsViewChangesModalOpen}
        visible={isViewChangesModalOpen}
      />
      <GenAITaskCreation
        currentLoggedInUser={currentLoggedInUser}
        setVisible={setCreateGenAIModal}
        visible={createGenAIModal}
      />
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />
    </div>
  );
}

function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
