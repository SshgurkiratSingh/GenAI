"use client";
import ClientOnly from "@/components/ClientOnly";
import AuthForm from "../components/AuthForm";
import getCurrentUser from "./actions/getCurrentUser";
import { useSession } from "next-auth/react";
type User = {
  name: string;
  email: string;
};
export default function Home() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          Welcome, {session.user.name}!
        </h2>
        <p className="mb-4">Email: {session.user.email}</p>
      </div>
    );
  }
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <ClientOnly>
        <div>Hi</div>
      </ClientOnly>
    </section>
  );
}
