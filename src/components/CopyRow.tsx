import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, Edit, Check, X } from "lucide-react";

interface Copy {
  id: string;
  copy_number: number;
  barcode: string;
  isbn?: string;
  status: string;
  notes?: string;
}

interface CopyRowProps {
  copy: Copy;
  onGenerateBarcode: (copy: Copy) => void;
  onUpdateCopy: (copyId: string, updates: { isbn?: string; status?: string; notes?: string }) => void;
}

export const CopyRow = ({ copy, onGenerateBarcode, onUpdateCopy }: CopyRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedIsbn, setEditedIsbn] = useState(copy.isbn || '');

  const handleSave = () => {
    onUpdateCopy(copy.id, { isbn: editedIsbn });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedIsbn(copy.isbn || '');
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between border rounded-lg p-3">
      <div className="flex-1">
        <div className="font-mono text-sm">{copy.barcode}</div>
        <div className="text-xs text-muted-foreground">
          Copy #{copy.copy_number} • Status: {copy.status}
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-xs text-muted-foreground">ISBN:</span>
          {isEditing ? (
            <div className="flex items-center space-x-1">
              <Input
                value={editedIsbn}
                onChange={(e) => setEditedIsbn(e.target.value)}
                className="h-6 text-xs"
                placeholder="Enter ISBN"
              />
              <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0">
                <Check className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 w-6 p-0">
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <span className="font-mono text-xs">{copy.isbn || 'Not assigned'}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-4 w-4 p-0"
              >
                <Edit className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onGenerateBarcode(copy)}
      >
        <BarChart3 className="w-4 h-4 mr-1" />
        Barcode
      </Button>
    </div>
  );
};