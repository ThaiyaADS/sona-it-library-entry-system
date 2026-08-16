"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Pencil, Loader2 } from "lucide-react";
import { createAdmin, updateAdmin } from "@/actions/admins";
import { toast } from "sonner";

interface AdminFormModalProps {
  mode: "ADD" | "EDIT";
  initialData?: any;
}

export default function AdminFormModal({ mode, initialData }: AdminFormModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const action = mode === "ADD" ? createAdmin : updateAdmin.bind(null, initialData?.id);
      const res = await action(data);

      if (res.success) {
        toast.success("Success", { description: res.message });
        setOpen(false);
      } else {
        toast.error("Error", { description: res.message });
      }
    } catch (err) {
      toast.error("Error", { description: "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={
        mode === "ADD" 
          ? "bg-slate-900 hover:bg-slate-800 text-white inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-9 px-4 py-2 cursor-pointer"
          : "bg-transparent hover:bg-slate-100 text-slate-700 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-8 w-8 cursor-pointer"
      }>
        {mode === "ADD" ? (
          <><UserPlus className="w-4 h-4 mr-2" /> Add Admin</>
        ) : (
          <Pencil className="w-4 h-4" />
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "ADD" ? "Add New" : "Edit"} Admin User</DialogTitle>
          <DialogDescription>
            {mode === "ADD" 
              ? "Create a new administrative account." 
              : "Update the admin details below. Leave password empty to keep existing password."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input 
              id="name" 
              name="name" 
              defaultValue={initialData?.name} 
              placeholder="e.g. Suresh Kumar"
              required 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="username">Username *</Label>
            <Input 
              id="username" 
              name="username" 
              defaultValue={initialData?.username} 
              placeholder="e.g. admin_suresh"
              required 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              name="email" 
              type="email"
              defaultValue={initialData?.email} 
              placeholder="e.g. admin@sonacollege.org"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password {mode === "EDIT" ? "(Optional)" : "*"}</Label>
            <Input 
              id="password" 
              name="password" 
              type="password"
              placeholder={mode === "EDIT" ? "••••••••" : "Enter password"}
              required={mode === "ADD"}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Details"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
