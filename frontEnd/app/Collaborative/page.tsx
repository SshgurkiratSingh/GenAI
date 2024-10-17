"use client";
import React, { useState } from "react";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { Chip } from "@nextui-org/chip";
import { toast } from "react-toastify";
import { useDisclosure } from "@nextui-org/modal";

import ChatModal from "@/components/ChatModal";
import SearchModal from "./Components/searchModal"; // Assuming you have a SearchModal component

export default function DocsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentLoggedInUser, setCurrentLoggedInUser] = useState<string>("GenAI");
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Simulate data refresh with error handling
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Simulating a network request or data fetch
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate 2 second delay
      toast.success("Data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-w-[90%] mt-0 pt-0 h-full">
      <title>Chat with AI</title>
      <Card fullWidth className="min-w-[1100px] w-full mt-0 pt-0">
        <CardHeader>
          <h1>Chat with AI Assistant</h1>
          <Divider orientation="vertical" /> <br />
          <Chip>
            <h2>{currentLoggedInUser}</h2>
          </Chip>
        </CardHeader>
        <Divider />
        <CardBody className="min-w-[900px]">
          <p>Welcome to the AI chat interface. Click below to start chatting with the AI assistant.</p>
        </CardBody>
        <Divider />
        <CardFooter className="flex gap-4">
          <Button
            color="secondary"
            variant="ghost"
            onPress={() => setIsChatModalOpen(true)}
          >
            Chat with AI
          </Button>
          <Button
            color="primary"
            disabled={isLoading}
            variant="ghost"
            onClick={refreshData}
          >
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </CardFooter>
      </Card>

 

      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />
    </div>
  );
}
