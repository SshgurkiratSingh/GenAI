"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { motion, AnimatePresence } from "framer-motion";

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  visible,
  onClose,
  onRegisterClick,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    signIn("credentials", {
      ...data,
      redirect: false,
    }).then((callback) => {
      setIsLoading(false);

      if (callback?.ok) {
        toast.success("Logged in successfully");
        router.refresh();
        onClose();
      }

      if (callback?.error) {
        toast.error(callback.error);
      }
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <Modal isOpen={visible} onOpenChange={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader>
                    <motion.h1
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      id="modal-title"
                    >
                      Welcome back
                    </motion.h1>
                  </ModalHeader>
                  <ModalBody>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Input
                        color={errors.email ? "danger" : "primary"}
                        size="lg"
                        placeholder="Email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "Invalid email address",
                          },
                        })}
                      />
                      {errors.email && (
                        <span style={{ color: "red" }}>
                          {errors.email.message as string}
                        </span>
                      )}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Input
                        type="password"
                        color={errors.password ? "danger" : "primary"}
                        size="lg"
                        placeholder="Password"
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters long",
                          },
                        })}
                      />
                      {errors.password && (
                        <span style={{ color: "red" }}>
                          {errors.password.message as string}
                        </span>
                      )}
                    </motion.div>
                  </ModalBody>
                  <ModalFooter>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button onClick={onClose}>Close</Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isLoading}
                      >
                        Login
                      </Button>
                    </motion.div>
                  </ModalFooter>
                  <div style={{ textAlign: "center", marginTop: "10px" }}>
                    <span>Don't have an account? </span>
                    <Button light auto onClick={onRegisterClick}>
                      Register
                    </Button>
                  </div>
                </>
              )}
            </ModalContent>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
