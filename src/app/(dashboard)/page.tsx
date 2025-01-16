"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Navbar } from "./navbar";

export default function Home() {
  const accounts = useQuery(api.accounts.get);

  if (accounts === undefined) {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-10 h-16 bg-white p-4">
        <Navbar />
      </div>
      <div className="mt-16">
        {accounts?.map((account) => (
          <span key={account._id}>{account.name}</span>
        ))}
      </div>
    </div>
  );
}
