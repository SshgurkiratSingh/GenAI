"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import zxcvbn from 'zxcvbn';

interface RegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  visible,
  onClose,
  onLoginClick,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FieldValues>({
    defaultValues: { name: "", email: "", password: "" },
  });

  const password = watch("password");

  useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setPasswordStrength(result.score);
    }
  }, [password]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    axios
      .post("/api/register", data)
      .then(() => {
        onClose();
        toast.success("Account Created. Please login to continue.");
        onLoginClick(); // Switch to login modal after successful registration
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Something went wrong.");
      })
      .finally(() => setIsLoading(false));
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
                    >
                      Create an Account
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
                        fullWidth
                        color={errors.name ? "danger" : "primary"}
                        size="lg"
                        placeholder="Name"
                        {...register("name", {
                          required: "Name is required",
                          minLength: {
                            value: 2,
                            message: "Name must be at least 2 characters long",
                          },
                        })}
                      />
                      {errors.name && (
                        <span style={{ color: "red" }}>
                          {errors.name.message as string}
                        </span>
                      )}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Input
                        fullWidth
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
                      <div style={{ marginTop: '5px' }}>
                        Password strength: {['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][passwordStrength]}
                      </div>
                    </motion.div>
                  </ModalBody>
                  <ModalFooter>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button variant="faded" color="danger" onClick={onClose}>
                        Close
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isLoading}
                      >
                        Sign Up
                      </Button>
                    </motion.div>
                  </ModalFooter>
                  <div style={{ textAlign: "center", marginTop: "10px" }}>
                    <span>Already have an account? </span>
                    <Button light auto onClick={onLoginClick}>
                      Login
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

export default RegisterModal;
