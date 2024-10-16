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
import { Input } from "@nextui-org/input";
import { toast } from "react-toastify";

const EditConfigModal: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [scrollBehavior, setScrollBehavior] = useState<string>("auto");
  const [wifiSSID, setWifiSSID] = useState<string>("Server_Fetched");
  const [wifiPassword, setWifiPassword] = useState<string>("Server_Fetched");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mqttServer, setMqttServer] = useState<string>("Server_Fetched");
  const [pingIdentityTopic, setPingIdentityTopic] =
    useState<string>("Server_Fetched");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScrollBehavior(event.target.value); // Use the value from the event
  };

  // Handlers for input changes
  const handleWifiSSIDChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWifiSSID(event.target.value);
  };

  const handleWifiPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setWifiPassword(event.target.value);
  };

  const handleMqttServerChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setMqttServer(event.target.value);
  };

  const handlePingIdentityTopicChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPingIdentityTopic(event.target.value);
  };

  return (
    <div className="flex flex-col gap-2 p-2">
      <Button
        className="min-w-1/2 gradient-text2 "
        color="secondary"
        variant="ghost"
        onPress={onOpen}
      >
        Edit Config
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
                  <Input
                    isClearable
                    className="max-w-[220px]"
                    isDisabled={isLoading}
                    label="Wifi SSID"
                    placeholder="Enter WiFi SSID"
                    radius={"md"}
                    value={wifiSSID}
                    onChange={handleWifiSSIDChange} // Use onChange to update state
                    onClear={() => setWifiSSID("")}
                  />
                  <Input
                    isClearable
                    className="max-w-[220px]"
                    isDisabled={isLoading}
                    label="Wifi Password"
                    placeholder="Enter the WiFi Password"
                    radius={"md"}
                    value={wifiPassword}
                    onChange={handleWifiPasswordChange} // Use onChange to update state
                    onClear={() => setWifiPassword("")}
                  />
                  <Input
                    isClearable
                    className="max-w-[220px]"
                    isDisabled={isLoading}
                    label="MQTT Server"
                    placeholder="Enter the MQTT Server"
                    radius={"md"}
                    value={mqttServer}
                    onChange={handleMqttServerChange} // Use onChange to update state
                    onClear={() => setMqttServer("")}
                  />
                  <Input
                    isClearable
                    className="max-w-[220px]"
                    isDisabled={isLoading}
                    label="Ping Identity Topic"
                    placeholder="Enter the Ping Identity Topic"
                    radius={"md"}
                    value={pingIdentityTopic}
                    onChange={handlePingIdentityTopicChange} // Use onChange to update state
                    onClear={() => setPingIdentityTopic("")}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    console.log({
                      wifiSSID,
                      wifiPassword,
                      mqttServer,
                      pingIdentityTopic,
                    });
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
