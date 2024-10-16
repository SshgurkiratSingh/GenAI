"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { toast } from "react-toastify";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Chip } from "@nextui-org/chip";

import Loading from "@/components/Loading";

// Define types for the API response
type ApiResponse = {
  summary: string;
  isNew: boolean;
};

type CommitSummary = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      refusal: null;
    };
    logprobs: null;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_tokens_details: {
      cached_tokens: number;
    };
    completion_tokens_details: {
      reasoning_tokens: number;
    };
  };
  system_fingerprint: string;
};

interface AiResultModalProps {
  setVisible: (visible: boolean) => void;
  visible: boolean;
  commitId: string;
  aiSummaryIfAvail: string | null;
}

export default function AiResultModal({
  setVisible,
  visible,
  commitId,
  aiSummaryIfAvail,
}: AiResultModalProps) {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [commitStats, setCommitStats] = useState<CommitSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [renderedContent, setRenderedContent] = useState<string>("");
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const renderMarkdown = async () => {
      if (aiSummary) {
        try {
          const htmlContent = await marked(aiSummary);
          const sanitizedHtml = DOMPurify.sanitize(htmlContent);

          setRenderedContent(sanitizedHtml);
        } catch (error) {
          console.error("Error rendering markdown:", error);
          setRenderedContent("Error rendering content");
        }
      }
    };

    renderMarkdown();
  }, [aiSummary]);

  useEffect(() => {
    if (visible && commitId) {
      if (aiSummaryIfAvail !== null) {
        try {
          let parsedSummary: CommitSummary;

          if (typeof aiSummaryIfAvail === "string") {
            parsedSummary = JSON.parse(aiSummaryIfAvail);
            console.log("it is string");
            console.log(typeof aiSummaryIfAvail);
            console.log(parsedSummary);
          } else if (typeof aiSummaryIfAvail === "object") {
            parsedSummary = aiSummaryIfAvail;
            console.log("it is object");
          } else {
            throw new Error("Invalid aiSummaryIfAvail format");
          }

          if (
            !parsedSummary.choices ||
            !parsedSummary.choices[0] ||
            !parsedSummary.choices[0].message
          ) {
            throw new Error("Unexpected API response structure");
          }

          const summaryContent = parsedSummary.choices[0].message.content;

          setAiSummary(summaryContent);
          setCommitStats(parsedSummary);
          setLoading(false);
        } catch (error) {
          console.error("Error parsing aiSummaryIfAvail:", error);
          toast.error("Failed to parse pre-fetched AI summary");
          setLoading(true);
          fetchAiSummary();
        }
      } else {
        setLoading(true);
        fetchAiSummary();
      }
    }
  }, [visible, commitId, aiSummaryIfAvail]);

  const fetchAiSummary = async () => {
    try {
      const response = await fetch(
        `http://localhost:2500/collab/commits/${commitId}/summary`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch AI summary");
      }
      const data: ApiResponse = await response.json();

      let parsedSummary: CommitSummary;

      if (typeof data.summary === "string") {
        parsedSummary = JSON.parse(data.summary);
      } else if (typeof data.summary === "object") {
        parsedSummary = data.summary;
      } else {
        throw new Error("Invalid summary format in API response");
      }

      if (
        !parsedSummary.choices ||
        !parsedSummary.choices[0] ||
        !parsedSummary.choices[0].message
      ) {
        throw new Error("Unexpected API response structure");
      }

      const summaryContent = parsedSummary.choices[0].message.content;

      setAiSummary(summaryContent);
      setCommitStats(parsedSummary);
    } catch (error) {
      console.error("Error fetching AI summary:", error);
      toast.error("Failed to fetch AI summary");
      setAiSummary("Error fetching summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderSummary = () => {
    if (loading) {
      return (
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <Loading />
        </section>
      );
    }
    if (!renderedContent) {
      return <p>No summary available</p>;
    }

    return (
      <div
        dangerouslySetInnerHTML={{ __html: renderedContent }}
        className="text-md text-left prose dark:prose-invert max-w-none"
      />
    );
  };

  const renderStats = () => {
    if (!commitStats) return null;

    const {
      usage: { prompt_tokens, completion_tokens, total_tokens },
      model,
      system_fingerprint,
      created,
    } = commitStats;

    return (
      <div className="text-sm mt-4 flex ">
        <h3 className="font-bold">Stats for Nerds</h3>
        <p>
          Model: <Chip>{model}</Chip>
        </p>
        <p>System Fingerprint: {system_fingerprint}</p>
        <p>Created: {new Date(created * 1000).toLocaleString()}</p>
        <p>
          Prompt Tokens:<Chip> {prompt_tokens}</Chip>
        </p>
        <p>
          Completion Tokens:<Chip> {completion_tokens}</Chip>
        </p>
        <p>
          Total Tokens:<Chip>{total_tokens}</Chip>
        </p>
      </div>
    );
  };

  return (
    <Modal
      backdrop="blur"
      className="bg-transparent border-none"
      isOpen={visible}
      scrollBehavior="outside"
      size="5xl"
      onOpenChange={setVisible}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              AI Summary for Commit {commitId}{" "}
              <Button
                color="primary"
                variant="light"
                onPress={() => setShowStats((prev) => !prev)}
              >
                {showStats ? "Hide Stats" : "Show Stats for Nerds"}
              </Button>
            </ModalHeader>
            <ModalBody className="flex flex-col gap-1 items-start">
              {renderSummary()}
              <Divider />

              {showStats && renderStats()}
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
