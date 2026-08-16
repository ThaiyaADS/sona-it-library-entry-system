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
      <DialogTrigger className={
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
            <Input 
              id="identifier" 
              name="identifier" 
              defaultValue={initialData?.identifier} 
              placeholder={isStudent ? "e.g. 23ADSBE179" : "e.g. FAC123"}
              required 
            />
          </div>

          {isStudent && (
            <div className="grid gap-2">
              <Label htmlFor="registerNumber">Register Number</Label>
              <Input 
                id="registerNumber" 
                name="registerNumber" 
                defaultValue={initialData?.registerNumber} 
                placeholder="e.g. 61782323110789"
              />
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" name="name" defaultValue={initialData?.name} placeholder="e.g. John Doe" required />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="department">Department *</Label>
            <select 
              id="department" 
              name="department" 
              defaultValue={initialData?.department || "IT"} 
              required
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white dark:bg-slate-900 dark:border-white/10 dark:text-slate-100 dark:focus-visible:ring-white/30 px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
            >
              <option value="IT">IT</option>
              <option value="ADS">ADS</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email{isStudent ? "" : " *"}</Label>
            <Input 
              id="email" 
              name="email" 
              type="email"
              defaultValue={initialData?.email} 
              placeholder="e.g. name@sonacollege.org"
              required={!isStudent}
            />
          </div>

          {isStudent ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="year">Year *</Label>
                <select 
                  id="year" 
                  name="year" 
                  defaultValue={initialData?.year || "I"} 
                  required
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white dark:bg-slate-900 dark:border-white/10 dark:text-slate-100 dark:focus-visible:ring-white/30 px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                >
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="section">Section *</Label>
                <select 
                  id="section" 
                  name="section" 
                  defaultValue={initialData?.section || "A"} 
                  required
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white dark:bg-slate-900 dark:border-white/10 dark:text-slate-100 dark:focus-visible:ring-white/30 px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" name="designation" defaultValue={initialData?.designation} placeholder="e.g. Assistant Professor" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="barcode">Barcode Scanner ID *</Label>
                <Input id="barcode" name="barcode" defaultValue={initialData?.barcode} placeholder="e.g. FAC-BAR-001" required />
              </div>
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
