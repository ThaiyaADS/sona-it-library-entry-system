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
import { Upload, Loader2, FileUp } from "lucide-react";
import { uploadDocument } from "@/actions/upload";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

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

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadDocument(formData, type);
      
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
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "An unexpected error occurred during upload.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const templateCsv = type === "STUDENT"
    ? "admissionNumber,name,department,email,registerNumber,year,section\n23ADSBE001,John Doe,ADS,johndoe@sonacollege.org,61782323110001,I,A"
    : "facultyId,name,department,email,designation,barcode\nFAC-IT-999,Dr. Alice Smith,IT,alicesmith@sonacollege.org,Professor,BARCODE-FAC-999";

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

  const downloadPdfTemplate = () => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`IT Library - ${type} Import Template`, 14, 20);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Instructions: Keep these column columns in matching order. Text entity recognizer will parse rows.", 14, 28);
    doc.text("Enter records one per line.", 14, 34);
    
    const headers = type === "STUDENT"
      ? ["admissionNumber", "name", "department", "email", "registerNumber", "year", "section"]
      : ["facultyId", "name", "department", "email", "designation"];
      
    const rows = type === "STUDENT"
      ? [["23ADSBE001", "John Doe", "ADS", "johndoe@sonacollege.org", "61782323110001", "I", "A"]]
      : [["FAC-IT-999", "Dr. Alice Smith", "IT", "alicesmith@sonacollege.org", "Professor"]];

    const startX = 14;
    const startY = 48;
    
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(startX - 2, startY - 5, 184, 8, "F");
    
    let xOffset = startX;
    headers.forEach((h, idx) => {
      doc.text(h, xOffset, startY);
      xOffset += idx === 1 ? 30 : idx === 3 ? 42 : 22;
    });
    
    doc.setFont("helvetica", "normal");
    let cellY = startY + 10;
    rows.forEach((r) => {
      let cellX = startX;
      r.forEach((cellText, idx) => {
        doc.text(cellText, cellX, cellY);
        cellX += idx === 1 ? 30 : idx === 3 ? 42 : 22;
      });
      cellY += 10;
    });

    doc.save(`${type.toLowerCase()}_template.pdf`);
  };

  const downloadWordTemplate = () => {
    const headers = type === "STUDENT"
      ? ["admissionNumber", "name", "department", "email", "registerNumber", "year", "section"]
      : ["facultyId", "name", "department", "email", "designation"];
      
    const rows = type === "STUDENT"
      ? [["23ADSBE001", "John Doe", "ADS", "johndoe@sonacollege.org", "61782323110001", "I", "A"]]
      : [["FAC-IT-999", "Dr. Alice Smith", "IT", "alicesmith@sonacollege.org", "Professor"]];

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${type} Template</title>
      <style>
        table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
      </style>
      </head>
      <body>
      <h2>IT Library - ${type} Import Template</h2>
      <p>Instructions: Modify the list table below and save the file before uploading.</p>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.map(r => `<tr>${r.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/msword;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${type.toLowerCase()}_template.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-9 px-4 py-2 cursor-pointer">
        <Upload className="w-4 h-4 mr-2" /> Import Users
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import {type === "STUDENT" ? "Students" : "Faculty"}</DialogTitle>
          <DialogDescription>
            Upload a CSV, PDF, or Word document (.docx) containing the details. Passwords will be set to their identifiers by default.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900/50 dark:border-white/10">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-8 h-8 mb-2 text-slate-500" />
                <p className="mb-2 text-sm text-slate-500 font-medium">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-slate-400">CSV, PDF, or Word (.docx) files only</p>
              </div>
              <input id="dropzone-file" type="file" accept=".csv,.pdf,.docx,.doc" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="flex flex-col gap-1 items-start">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Templates:</span>
              <div className="flex gap-2">
                <Button variant="link" onClick={downloadTemplate} className="text-blue-600 px-0 text-xs font-bold h-auto py-0">
                  CSV
                </Button>
                <span className="text-slate-300 dark:text-white/10 self-center text-xs">|</span>
                <Button variant="link" onClick={downloadPdfTemplate} className="text-blue-600 px-0 text-xs font-bold h-auto py-0">
                  PDF
                </Button>
                <span className="text-slate-300 dark:text-white/10 self-center text-xs">|</span>
                <Button variant="link" onClick={downloadWordTemplate} className="text-blue-600 px-0 text-xs font-bold h-auto py-0">
                  Word
                </Button>
              </div>
            </div>
            <Button onClick={handleUpload} disabled={!file || isUploading} className="bg-slate-900 text-white cursor-pointer self-end">
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Importing..." : "Start Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
