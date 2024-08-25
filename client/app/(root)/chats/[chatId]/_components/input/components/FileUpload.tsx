import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Image, Paperclip } from "lucide-react";
import React, { useRef, useState } from "react";
import FileUploadDialog from "./FileUploadDialog";

type Props = {};

const FileUpload = (props: Props) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"image" | "document" | null>(null);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setFileType("image");
      } else {
        setFileType("document");
      }
      setFileDialogOpen(true);
    }
  };

  const handleUploadClick = (type: "image" | "document") => {
    if (type === "image" && imageInputRef.current) {
      imageInputRef.current.click();
    } else if (type === "document" && documentInputRef.current) {
      documentInputRef.current.click();
    }
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button type="button" variant="ghost" size="icon">
            <Paperclip />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleUploadClick("image")}>
            <Image className="mr-3 h-4 w-4" /> Photo or Video
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleUploadClick("document")}>
            <FileText className="mr-3 h-4 w-4" />
            Document
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        ref={documentInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <FileUploadDialog
        fileDialogOpen={fileDialogOpen}
        setFileDialogOpen={setFileDialogOpen}
        fileType={fileType}
        selectedFile={selectedFile}
      />
    </div>
  );
};

export default FileUpload;
