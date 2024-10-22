import { Button } from "@nextui-org/button";
import { Upload, Folder, RefreshCcw } from "lucide-react";

interface FileListProps {
  userFiles: string[];
  selectedFiles: string[];
  onFileSelect: (file: string) => void;
  onUploadClick: () => void;
  onRefreshClick: () => void; // New prop for refresh functionality
}

const FileList = ({
  userFiles,
  selectedFiles,
  onFileSelect,
  onUploadClick,
  onRefreshClick, // Destructure the new prop
}: FileListProps) => {
  return (
    <div className="w-full md:w-1/4 border-l pl-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <p className="font-medium">Your Files (Expand Context)</p>
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={onUploadClick}
            startContent={<Upload size={16} />}
          >
            Upload
          </Button>
          <Button
            size="sm"
            onClick={onRefreshClick} // Attach the onClick handler
            startContent={<RefreshCcw size={16} />} // Add Refresh icon
          >
            Refresh
          </Button>
        </div>
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
