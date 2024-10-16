"use client";
import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
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
      href: "/chat",
    },
    {
      name: "About Us",
      href: "/about",
    },
  ];

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
        <NavbarContent justify="start" className="mr-auto"> {/* Added mr-auto for left alignment */}
          <NavbarBrand>
            <p className="font-bold text-inherit gradient-text">PDF Reader</p>
          </NavbarBrand>
        </NavbarContent>

        {/* Center the menu items */}
        <NavbarContent className="flex justify-center gap-4" justify="center">
          {items.map((item, index) => (
            <NavbarItem key={`${item}-${index}`}>
              <Link color="foreground" href={item.href}>
                <Button color="primary" variant="ghost">
                  {item.name}
                </Button>
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        {/* Align right - Welcome Message and Logout */}
        <NavbarContent justify="end">
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
          ) : null /* Remove Login and Sign Up buttons */ }
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