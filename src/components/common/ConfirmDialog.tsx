import { useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  triggerLabel: string;
  triggerClassName?: string;
  disabled?: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
  icon?: ReactNode; // optional icon
  onConfirm: () => void;
}

export default function ConfirmDialog({
  triggerLabel,
  triggerClassName = '',
  disabled = false,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  actionLabel = 'Confirm',
  icon,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        disabled={disabled}
        className={triggerClassName}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {icon && <span className="gap-2 flex items-center">{icon}</span>}
        {triggerLabel}
      </Button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();

                setOpen(false);
              }}
            >
              Cancel
            </Button>

            <Button className="flex justify-center items-center" onClick={handleConfirm}>
              {icon && <span className="gap-2">{icon}</span>}
              {actionLabel && actionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
