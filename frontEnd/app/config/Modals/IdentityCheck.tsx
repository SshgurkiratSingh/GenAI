"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { toast } from "react-toastify";

const EditConfigModal: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-2 p-2">
      <Button
        className="min-w-1/2 gradient-text2 "
        color="secondary"
        variant="ghost"
        onPress={onOpen}
      >
        Node Identity Logs
      </Button>

      <Modal
        isOpen={isOpen}
        scrollBehavior={"inside"}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose: any) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Config Settings
              </ModalHeader>
              <ModalBody>
                <Divider />
                <Popover className="" color={"secondary"} placement="top">
                  <PopoverTrigger>
                    <Button className="capitalize w-1/2" color={"warning"}>
                      Connection Details
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="px-1 py-2">
                      <div className="text-small font-bold">
                        Connected to Master Node By:
                      </div>
                      <div className="text-tiny">MQTT Broker</div>
                      <Button className="capitalize" color="warning" size="sm">
                        Ping
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <Divider />
                <div className="flex flex-col gap-1 items-center">
                  <Button className="capitalize" color="warning" size="sm">
                    Send Ping Identity
                  </Button>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    toast.success("Config Updated Successfully");
                    onClose();
                  }}
                >
                  Update Config
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default EditConfigModal;
