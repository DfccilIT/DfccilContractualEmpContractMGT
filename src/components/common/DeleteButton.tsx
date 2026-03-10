import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';

interface Props {
  row: { pkId: number };
  handleRemove: (id: number) => void;
}

export default function DeleteButton({ row, handleRemove }: Props) {
  const [open, setOpen] = useState(false);
  console.log(row);
  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Trash2 className="text-red-500" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">Are you sure you want to delete this record? This action cannot be undone.</p>
          <DialogFooter className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleRemove(row.pkId);
                setOpen(false);
              }}
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
