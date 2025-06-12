import React from 'react';
import { Dialog, DialogProps } from '@/components/ui/dialog';

interface SafeDialogProps extends DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

// Este componente garante que o modal sempre pode ser fechado
export const SafeDialog: React.FC<SafeDialogProps> = ({ 
  open, 
  onOpenChange, 
  children,
  ...props 
}) => {
  const handleOpenChange = (newOpen: boolean) => {
    // Sempre permite fechar o modal
    if (!newOpen) {
      onOpenChange(false);
    } else {
      onOpenChange(newOpen);
    }
  };

  // Adiciona listener para ESC key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onOpenChange]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
      {...props}
    >
      {children}
    </Dialog>
  );
};

export default SafeDialog;