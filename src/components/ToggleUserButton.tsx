"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { UserMinus, UserCheck, Loader2 } from "lucide-react";
import { toggleUserStatus } from "@/actions/users";
import { toast } from "sonner";

interface ToggleUserButtonProps {
  id: string;
  isActive: boolean;
  role: "STUDENT" | "FACULTY";
}

export default function ToggleUserButton({ id, isActive, role }: ToggleUserButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleUserStatus(id, isActive, role);
      if (res.success) {
        toast.success("Success", { description: res.message });
      } else {
        toast.error("Error", { description: res.message });
      }
    });
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleToggle} 
      disabled={isPending}
      title={isActive ? "Deactivate User" : "Activate User"}
      className={isActive ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isActive ? (
        <UserMinus className="w-4 h-4" />
      ) : (
        <UserCheck className="w-4 h-4" />
      )}
    </Button>
  );
}
