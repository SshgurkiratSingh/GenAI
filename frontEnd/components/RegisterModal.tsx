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
      // Add password strength logic (if you have a library like zxcvbn)
      const result = zxcvbn(password); // This assumes you have zxcvbn installed
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
    <>
      {visible && (
        <Modal isOpen={visible} onOpenChange={onClose} isCentered={true}>
          <ModalContent>
            <ModalHeader>
              <h1>Create an Account</h1>
            </ModalHeader>
            <ModalBody>
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

              <div style={{ marginTop: "5px" }}>
                Password strength:{" "}
                {["Very Weak", "Weak", "Fair", "Strong", "Very Strong"][passwordStrength]}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="faded" color="danger" onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                Sign Up
              </Button>
            </ModalFooter>
            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <span>Already have an account? </span>
              <Button onClick={onLoginClick}>Login</Button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default RegisterModal;