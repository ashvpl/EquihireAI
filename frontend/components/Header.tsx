"use client";

import { UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="flex items-center justify-between h-16 px-8 border-b bg-white">
      <h1 className="text-lg font-semibold text-slate-800">Analyze Interview Questions</h1>
      <div className="flex items-center space-x-4">
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
