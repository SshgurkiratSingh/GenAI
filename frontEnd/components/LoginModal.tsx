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
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'; // Correctly imported Material Design icons

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
  const [showPassword, setShowPassword] = useState<boolean>(false); // State to toggle password visibility

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
        onClose(); // Close the modal only on success
      } else if (callback?.error) {
        toast.error(callback.error);
      }
    });
  };

  return (
    <>
      {visible && (
        <Modal isOpen={visible} onOpenChange={onClose}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  <h1 id="modal-title">Welcome back</h1>
                </ModalHeader>
                <ModalBody>
                  <div>
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
                  </div>
                  <div style={{ marginTop: '10px', position: 'relative' }}>
                    <Input
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
                </ModalBody>
                <ModalFooter>
                  <Button onClick={onClose} disabled={isLoading}>
                    Close
                  </Button>
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </ModalFooter>
                <div style={{ textAlign: "center", marginTop: "10px" }}>
                  <span>Don&apos;t have an account? </span>
                  <Button onClick={onRegisterClick}>
                    Register
                  </Button>
                </div>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default LoginModal;
