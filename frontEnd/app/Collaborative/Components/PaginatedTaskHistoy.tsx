import React, { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { Chip } from "@nextui-org/chip";
import { Button } from "@nextui-org/button";
import { Accordion, AccordionItem } from "@nextui-org/accordion";

interface CommitLogEntry {
  id: string;
  user: string;
  codeChanged: string;
  gitCommitLink: string;
  comment: string;
  generatedSummary: string;
  createdAt: string;
  updatedAt: string;
}

type CommitLog = CommitLogEntry[];

interface PaginatedTaskHistoryProps {
  taskHistory: CommitLog;
  handleViewChanges: (commitId: string) => void;
  handleViewAiSummary: (
    gitCommitLink: string,
    generatedSummary: string
  ) => void;
  formatRelativeTime: (date: string) => string;
  extractCommitId: (gitCommitLink: string) => string;
}

const PaginatedTaskHistory: React.FC<PaginatedTaskHistoryProps> = ({
  taskHistory,
  handleViewChanges,
  handleViewAiSummary,
  formatRelativeTime,
  extractCommitId,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(taskHistory.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = taskHistory.slice(startIndex, endIndex);

  const nextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const itemClasses = {
    base: "py-2 w-full",
    title: "font-normal text-medium",
    indicator: "text-medium",
    content: "text-small px-2",
  };

  return (
    <Card fullWidth isHoverable className="max-w-[500px]">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md">Team Task History</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="min-w-[500px]">
        {taskHistory.length > 0 ? (
          <Accordion
            isCompact
            className="p-2 flex flex-col gap-1 w-full max-w-[500px]"
            itemClasses={itemClasses}
            variant="shadow"
          >
            {currentItems.map((task, index) => (
              <AccordionItem
                key={index}
                aria-label={`Accordion ${index + 1}`}
                startContent={
                  <Chip
                    color={
                      task.codeChanged === "autoFetch" ? "success" : "primary"
                    }
                  >
                    {task.codeChanged}
                  </Chip>
                }
                title={`${task.user}: ${task.comment}`}
              >
                <div>{formatRelativeTime(task.createdAt)}</div>
                <div className="flex flex-row gap-2">
                  <Button
                    onPress={() =>
                      handleViewChanges(extractCommitId(task.gitCommitLink))
                    }
                  >
                    View Changes
                  </Button>
                  <Button
                    onPress={() =>
                      handleViewAiSummary(
                        task.gitCommitLink,
                        task.generatedSummary
                      )
                    }
                  >
                    View AI Summary
                  </Button>
                  <a
                    href={task.gitCommitLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button>View Commit</Button>
                  </a>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Chip color="danger">No tasks history found</Chip>
        )}
      </CardBody>
      <Divider />
      <CardFooter>
        <div className="flex justify-between w-full">
          <Button disabled={currentPage === 0} onPress={prevPage}>
            Previous
          </Button>
          <span>
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button disabled={currentPage === totalPages - 1} onPress={nextPage}>
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PaginatedTaskHistory;
