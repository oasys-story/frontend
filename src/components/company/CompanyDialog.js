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
  const [formData, setFormData] = useState({
    companyName: '',
    phoneNumber: '',
    faxNumber: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      companyName: '',
      phoneNumber: '',
      faxNumber: '',
      notes: ''
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
            value={formData.companyName}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="연락처"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="010-0000-0000"
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="FAX"
            name="faxNumber"
            value={formData.faxNumber}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="비고"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button 
          onClick={onClose}
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
  );
};

export default CompanyDialog; 