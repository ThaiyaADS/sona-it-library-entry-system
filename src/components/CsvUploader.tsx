"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Loader2, FileUp } from "lucide-react";
import { uploadStudentsCSV, uploadFacultyCSV } from "@/actions/upload";
import { toast } from "sonner";

interface CsvUploaderProps {
  type: "STUDENT" | "FACULTY";
}

export default function CsvUploader({ type }: CsvUploaderProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const action = type === "STUDENT" ? uploadStudentsCSV : uploadFacultyCSV;
          const res = await action({ rows: results.data });
          
          if (res.success) {
            toast.success("Upload Successful", {
              description: res.message,
            });
            setOpen(false);
            setFile(null);
          } else {
            toast.error("Upload Failed", {
              description: res.message,
            });
          }
        } catch (error) {
          toast.error("Error", {
            description: "An unexpected error occurred during upload.",
          });
        } finally {
          setIsUploading(false);
        }
      },
      error: (error) => {
        toast.error("CSV Parsing Error", {
          description: error.message,
        });
        setIsUploading(false);
      },
    });
  };

  const templateCsv = type === "STUDENT"
    ? "identifier,name,department,course,year,section,barcode\n23ADSBE179,THAIYANANTH V S,AI & DS,B.Tech,IV,A,23ADSBE179"
    : "identifier,name,department,designation,barcode\nFAC-IT-001,Dr. Y. Suresh,Information Technology,Assistant Professor,FAC-IT-001";

  const downloadTemplate = () => {
    const blob = new Blob([templateCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${type.toLowerCase()}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-9 px-4 py-2">
        <Upload className="w-4 h-4 mr-2" /> Import from CSV
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import {type === "STUDENT" ? "Students" : "Faculty"}</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing the details. Passwords will be set to their identifier by default.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-8 h-8 mb-2 text-slate-500" />
                <p className="mb-2 text-sm text-slate-500 font-medium">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-slate-400">CSV files only</p>
              </div>
              <input id="dropzone-file" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="link" onClick={downloadTemplate} className="text-blue-600 px-0">
              Download sample template
            </Button>
            <Button onClick={handleUpload} disabled={!file || isUploading} className="bg-slate-900">
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Uploading..." : "Start Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
