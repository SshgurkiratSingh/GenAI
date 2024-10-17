"use client";
import React, { useState } from "react";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { Chip } from "@nextui-org/chip";
import { toast } from "react-toastify";
import { useDisclosure } from "@nextui-org/modal";

import ChatModal from "@/components/ChatModal";

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
    <div className="flex flex-col items-center justify-center w-full h-screen p-4">
      <title>Chat with AI</title>

      {/* Apply stronger shadow and hover animation */}
      <Card className="w-full max-w-[1100px] shadow-2xl bg-white transition-transform transform hover:scale-105 hover:shadow-3xl duration-300 ease-in-out">
        <CardHeader className="flex flex-col items-center">
          {/* Gradient Text */}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Chat with AI Assistant
          </h1>
          <Divider orientation="horizontal" className="my-4 w-1/2" />
          <Chip className="bg-blue-100 text-blue-700">
            <h2>{currentLoggedInUser}</h2>
          </Chip>
        </CardHeader>

        <Divider className="my-2" />

        <CardBody className="text-center">
          <p className="text-gray-600">
            Welcome to the AI chat interface. Click below to start chatting with the AI assistant.
          </p>
        </CardBody>

        <Divider className="my-2" />

        <CardFooter className="flex justify-center gap-4 py-4">
          <Button
            color="secondary"
            variant="ghost"
            onPress={() => setIsChatModalOpen(true)}
            className="hover:bg-secondary hover:text-white transition-colors"
          >
            Chat with AI
          </Button>

          <Button
            color="primary"
            variant="ghost"
            disabled={isLoading}
            onClick={refreshData}
            className="hover:bg-primary hover:text-white transition-colors"
          >
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </CardFooter>
      </Card>

      {/* Modals */}
 

      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />
    </div>
  );
}