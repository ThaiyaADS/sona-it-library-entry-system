"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, X, Check } from "lucide-react";
import { deleteAdmin } from "@/actions/admins";
import { toast } from "sonner";

interface DeleteAdminButtonProps {
  id: string;
  username: string;
}

export default function DeleteAdminButton({ id, username }: DeleteAdminButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteAdmin(id);
      if (res.success) {
        toast.success("Success", { description: res.message });
      } else {
        toast.error("Error", { description: res.message });
      }
      setShowConfirm(false);
    });
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-500/20 rounded-md p-1 animate-in fade-in duration-200">
        <span className="text-xs text-red-700 dark:text-red-400 px-1 font-semibold">Delete?</span>
        <Button 
          variant="ghost" 
          size="icon-xs"
          onClick={handleDelete}
          disabled={isPending}
          className="text-red-600 hover:text-red-700 hover:bg-red-105"
          title="Confirm Delete"
        >
          {isPending ? <Loader2 className="w-3 animate-spin" /> : <Check className="w-3 h-3" />}
        </Button>
        <Button 
          variant="ghost" 
          size="icon-xs"
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100"
          title="Cancel"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => setShowConfirm(true)}
      title="Delete Admin"
      className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
