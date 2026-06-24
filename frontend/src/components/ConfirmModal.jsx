import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const ConfirmModal = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false,
  showCancel = true,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel || onConfirm}
      PaperProps={{
        sx: {
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '8px',
          maxWidth: '400px',
          width: '100%',
        },
      }}
    >
      <DialogTitle sx={{ color: 'var(--color-primary)', fontWeight: 600 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: '16px', gap: '8px' }}>
        {showCancel && onCancel && (
          <Button
            onClick={onCancel}
            variant="outlined"
            sx={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              textTransform: 'none',
              '&:hover': {
                borderColor: 'var(--color-text-secondary)',
                backgroundColor: 'var(--bg-input)',
              },
            }}
          >
            {cancelText}
          </Button>
        )}
        <Button
          onClick={onConfirm}
          variant="contained"
          color={isDestructive ? 'error' : 'primary'}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            ...(isDestructive
              ? {}
              : {
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--bg-page)',
                  '&:hover': {
                    opacity: 0.9,
                  },
                }),
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmModal;
