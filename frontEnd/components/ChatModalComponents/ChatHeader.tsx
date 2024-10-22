import { Button, Switch, Chip } from "@nextui-org/react";
import { Download } from "lucide-react";

interface ChatHeaderProps {
  modalTitle: string;
  fileName?: string;
  autoSave: boolean;
  onAutoSaveChange: (checked: boolean) => void;
  onExport: () => void;
}

const ChatHeader = ({
  modalTitle,
  fileName,
  autoSave,
  onAutoSaveChange,
  onExport,
}: ChatHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <span>{modalTitle}</span>
      <div className="flex items-center space-x-2">
        {fileName && (
          <Chip size="sm" color="primary">
            {fileName}
          </Chip>
        )}
        <Switch
          checked={autoSave}
          onChange={(e) => onAutoSaveChange(e.target.checked)}
          size="sm"
        >
          Auto-save
        </Switch>
        <Button size="sm" onClick={onExport}>
          <Download size={16} />
          Export Chat
        </Button>
      </div>
    </div>
  );
};
export default ChatHeader;