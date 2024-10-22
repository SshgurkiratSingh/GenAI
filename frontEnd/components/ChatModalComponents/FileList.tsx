import { Button } from "@nextui-org/button";
import { Upload, Folder } from "lucide-react";

interface FileListProps {
  userFiles: string[];
  selectedFiles: string[];
  onFileSelect: (file: string) => void;
  onUploadClick: () => void;
}

const FileList = ({
  userFiles,
  selectedFiles,
  onFileSelect,
  onUploadClick,
}: FileListProps) => {
  return (
    <div className="w-1/4 border-l pl-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <p className="font-medium">Your Files (Expand Context)</p>
        <Button
          size="sm"
          onClick={onUploadClick}
          startContent={<Upload size={16} />}
        >
          Upload
        </Button>
      </div>
      {userFiles.map((file) => (
        <div key={file} className="flex items-center mb-1">
          <input
            type="checkbox"
            checked={selectedFiles.includes(file)}
            onChange={() => onFileSelect(file)}
            className="mr-2"
          />
          <div className="flex items-center">
            <Folder size={16} className="mr-2" /> {file}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;
