"use client";
import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/navbar";
import Link from "next/link";
import { Button } from "@nextui-org/button";
import { useSession, signOut } from "next-auth/react";

import { ThemeSwitch } from "./theme-switch";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const { data: session } = useSession();

  const items = [
    {
      name: "Home",
      href: "/",
    },

     {
      name: "Browse History",
      href: "/config",
    },
    {
      name: "About Us",
      href: "/about",
    },
   
  ];

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleRegisterClick = () => {
    setIsRegisterModalOpen(true);
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <>
      <Navbar
        isBordered
        className="rounded-xl"
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        {/* Align left - PDF Reader */}
        <NavbarContent justify="start">
          <NavbarBrand>
            <p className="font-bold text-inherit gradient-text">PDF Reader</p>
          </NavbarBrand>
        </NavbarContent>

        {/* Center the menu items */}
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {items.map((item, index) => (
            <NavbarItem key={`${item}-${index}`}>
              <Link color="foreground" href={item.href}>
                <Button color="primary" href="/" variant="ghost">
                  {item.name}
                </Button>
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        {/* Align right - Login, Sign Up, and ThemeSwitch */}
        <NavbarContent justify="end">
          <NavbarItem>
            <ThemeSwitch />
          </NavbarItem>

          {session ? (
            <>
              <NavbarItem>
                <span>Welcome, {session.user?.name}</span>
              </NavbarItem>
              <NavbarItem>
                <Button color="primary" onClick={handleLogout}>
                  Logout
                </Button>
              </NavbarItem>
            </>
          ) : (
            <>
              <NavbarItem>
                <Button color="primary" onClick={handleLoginClick}>
                  Login
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Button color="secondary" onClick={handleRegisterClick}>
                  Sign Up
                </Button>
              </NavbarItem>
            </>
          )}
        </NavbarContent>

        <NavbarMenu>
          {items.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                className="w-full"
                color={
                  index === 2
                    ? "warning"
                    : index === items.length - 1
                    ? "danger"
                    : "foreground"
                }
                href={item.href}
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>

      <LoginModal
        visible={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onRegisterClick={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      <RegisterModal
        visible={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onLoginClick={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </>
  );
};

export default NavigationBar;
