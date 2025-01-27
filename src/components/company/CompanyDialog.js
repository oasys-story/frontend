import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
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

  return (
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
            label="주소"
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
          onClick={() => onSubmit(companyData)}
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
  );
};

export default CompanyDialog; 