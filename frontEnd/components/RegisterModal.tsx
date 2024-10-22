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
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'; // Importing visibility icons

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
  const [passwordStrength, setPasswordStrength] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false); // State for toggling password visibility

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FieldValues>({
    defaultValues: { name: "", email: "", password: "" },
  });

  const password = watch("password");

  // Custom password strength checker
  useEffect(() => {
    if (password) {
      const evaluatePasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength += 1; // Minimum length
        if (/[A-Z]/.test(password)) strength += 1; // Contains uppercase letter
        if (/[a-z]/.test(password)) strength += 1; // Contains lowercase letter
        if (/[0-9]/.test(password)) strength += 1; // Contains a digit
        if (/[\W]/.test(password)) strength += 1; // Contains special character

        // Set corresponding strength label
        switch (strength) {
          case 0:
          case 1:
            return "Very Weak";
          case 2:
            return "Weak";
          case 3:
            return "Fair";
          case 4:
            return "Strong";
          case 5:
            return "Very Strong";
          default:
            return "";
        }
      };

      setPasswordStrength(evaluatePasswordStrength(password));
    } else {
      setPasswordStrength(""); // Reset if no password is typed
    }
  }, [password]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    axios
      .post("/api/register", data)
      .then(() => {
        onClose();
        toast.success("Account created successfully. Please login to continue.");
        onLoginClick(); // Switch to login modal after successful registration
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "An error occurred during registration.");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      {visible && (
        <Modal isOpen={visible} onOpenChange={onClose}>
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

              <div style={{ marginTop: '10px', position: 'relative' }}>
                <Input
                  fullWidth
                  type={showPassword ? "text" : "password"} // Toggle between text and password
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
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)} // Toggle password visibility
                  style={{
                    cursor: "pointer",
                    position: "absolute",
                    right: '10px',
                    top: '50%', // Center vertically
                    transform: 'translateY(-50%)', // Adjust for centering
                    background: 'transparent', // Make background transparent
                    border: 'none', // Remove button border
                    padding: 0, // Remove padding
                    outline: 'none' // Remove outline
                  }}
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />} {/* Icons for visibility */}
                </button>
              </div>

              <div style={{ marginTop: "5px" }}>
                Password strength: {passwordStrength}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="faded" color="danger" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleSubmit(onSubmit)} disabled={isLoading}>
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
