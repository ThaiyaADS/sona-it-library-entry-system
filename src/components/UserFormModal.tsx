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
import { createUser, updateUser } from "@/actions/users";
import { toast } from "sonner";

interface UserFormModalProps {
  type: "STUDENT" | "FACULTY";
  mode: "ADD" | "EDIT";
  initialData?: any;
}

export default function UserFormModal({ type, mode, initialData }: UserFormModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    data.role = type;

    try {
      const action = mode === "ADD" ? createUser : updateUser.bind(null, initialData?.id);
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

  const isStudent = type === "STUDENT";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={false} className={
        mode === "ADD" 
          ? "bg-slate-900 hover:bg-slate-800 text-white inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-9 px-4 py-2"
          : "bg-transparent hover:bg-slate-100 text-slate-700 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-8 w-8"
      }>
        {mode === "ADD" ? (
           <><UserPlus className="w-4 h-4 mr-2" /> Add {isStudent ? "Student" : "Faculty"}</>
        ) : (
           <Pencil className="w-4 h-4" />
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "ADD" ? "Add New" : "Edit"} {isStudent ? "Student" : "Faculty"}</DialogTitle>
          <DialogDescription>
            {mode === "ADD" 
              ? `Fill out the details below. Their default password will be their ${isStudent ? 'Admission Number' : 'Faculty ID'}.` 
              : "Update the user's details below."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="identifier">{isStudent ? "Admission Number" : "Faculty ID"} *</Label>
            <Input id="identifier" name="identifier" defaultValue={initialData?.identifier} required />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" name="name" defaultValue={initialData?.name} required />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="department">Department *</Label>
            <Input id="department" name="department" defaultValue={initialData?.department} required />
          </div>

          {isStudent ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="course">Course (e.g. B.Tech)</Label>
                  <Input id="course" name="course" defaultValue={initialData?.course} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="year">Year (e.g. I, II, III, IV)</Label>
                  <Input id="year" name="year" defaultValue={initialData?.year} />
                </div>
              </div>
            </>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" name="designation" defaultValue={initialData?.designation} />
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "ADD" ? "Create" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
