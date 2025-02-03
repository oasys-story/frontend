import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert
} from '@mui/material';

const CompanyDialog = ({ open, onClose, onSubmit }) => {
  const initialState = {
    companyName: '',
    phoneNumber: '',
    faxNumber: '',
    address: '',
    active: true
  };

  const [companyData, setCompanyData] = useState(initialState);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    setCompanyData(initialState);
    onClose();
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(companyData);
      setSnackbar({
        open: true,
        message: '업체가 성공적으로 등록되었습니다.',
        severity: 'success'
      });
      handleClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: '업체 등록에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          업체 추가
        </DialogTitle>
        
        <DialogContent sx={{ pb: 0 }}>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="업체명"
              name="companyName"
              value={companyData.companyName}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="연락처"
              name="phoneNumber"
              value={companyData.phoneNumber}
              onChange={handleChange}
              placeholder="010-0000-0000"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="FAX"
              name="faxNumber"
              value={companyData.faxNumber}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="메모"
              name="address"
              value={companyData.address}
              onChange={handleChange}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleClose}
            variant="outlined"
            fullWidth
            sx={{ mr: 1 }}
          >
            취소
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#1C243A',
              '&:hover': {
                bgcolor: '#3d63b8'
              }
            }}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: 3,
            fontSize: '0.95rem'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CompanyDialog; 