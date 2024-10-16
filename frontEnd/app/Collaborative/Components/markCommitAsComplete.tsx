"use client";
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

import { SearchIcon } from "@/components/icons";

/**
 * A modal component for searching History Logs, Assignments and Changes.
 *
 * @param {{ setVisible: (visible: boolean) => void, visible: boolean }} props
 * @prop {boolean} visible Whether or not the modal is visible.
 * @prop {(visible: boolean) => void} setVisible A function to set the visibility of the modal.
 */

export default function MarkCommitAsComplete({
  setVisible,
  visible,
}: {
  setVisible: (visible: boolean) => void;
  visible: boolean;
}) {
  return (
    <Modal
      backdrop="blur"
      className="bg-transparent border-none "
      isOpen={visible}
      scrollBehavior={"inside"}
      onOpenChange={setVisible}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              Attach Commit
            </ModalHeader>
            <ModalBody className="flex flex-col gap-1 text-center items-center ">
              <Input
                isRequired
                className="max-w-xs"
                startContent={
                  <SearchIcon color="currentColor" height={20} width={20} />
                }
              />
              <Divider />
            </ModalBody>
            <ModalFooter className="flex flex-row gap-1 items-center justify-center">
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={onClose}>
                Search
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
