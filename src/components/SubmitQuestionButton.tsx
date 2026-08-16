"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PlusCircle } from "lucide-react";
import SubmitQuestionModal from "@/components/SubmitQuestionModal";

export default function SubmitQuestionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setIsSignedIn(true);
      setChecked(true);
    });
  }, []);

  const handleClick = () => {
    if (isSignedIn) {
      setIsOpen(true);
    } else {
      router.push("/auth/signin");
    }
  };

  if (!checked) return null;

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 bg-primary text-card px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
      >
        <PlusCircle size={18} /> Ask a Question
      </button>
      {isOpen && <SubmitQuestionModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
