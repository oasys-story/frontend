import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Slide,
  IconButton,
  Paper,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MessageIcon from '@mui/icons-material/Message';
import axios from 'axios';

const ContactForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
    agreement: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 전화번호 형식 검증 함수
  const validatePhone = (phone) => {
    const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
    return phoneRegex.test(phone);
  };

  // API 호출 함수
  const sendInquiry = async (inquiryData) => {
    try {
      const params = new URLSearchParams();
      params.append('name', inquiryData.name);
      params.append('phone', inquiryData.phone);
      params.append('content', inquiryData.message);

      const response = await axios.post('http://localhost:8080/api/sms/send', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('문의 전송 실패:', error);
      return false;
    }
  };

  // 폼 제출 핸들러 수정
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreement) {
      setSnackbar({
        open: true,
        message: '개인정보 처리방침에 동의해주세요.',
        severity: 'error'
      });
      return;
    }

    // 전화번호 형식 검증
    if (!validatePhone(formData.phone)) {
      setSnackbar({
        open: true,
        message: '올바른 전화번호 형식이 아닙니다.',
        severity: 'error'
      });
      return;
    }

    // 로딩 상태 표시 추가
    setSnackbar({
      open: true,
      message: '전송 중입니다...',
      severity: 'info'
    });

    const success = await sendInquiry(formData);
    
    if (success) {
      setSnackbar({
        open: true,
        message: '문의사항이 전송되었습니다.',
        severity: 'success'
      });
      setFormData({ name: '', phone: '', message: '', agreement: false });
      setIsOpen(false);
    } else {
      setSnackbar({
        open: true,
        message: '전송에 실패했습니다. 다시 시도해주세요.',
        severity: 'error'
      });
    }
  };

  // TextField의 onChange 핸들러 수정 (전화번호 자동 하이픈 추가)
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    let formattedPhone = value;
    if (value.length >= 3) {
      formattedPhone = value.replace(/(\d{3})(\d{0,4})(\d{0,4})/, '$1-$2-$3').replace(/-{1,2}$/, '');
    }
    setFormData({ ...formData, phone: formattedPhone });
  };

  return (
    <>
      {/* 문의하기 버튼 */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
      >
        <Button
          variant="contained"
          onClick={() => setIsOpen(!isOpen)}
          startIcon={<MessageIcon />}
          sx={{
            bgcolor: '#343959',
            '&:hover': { bgcolor: '#3d63b8' },
            borderRadius: '25px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: '10px 20px'
          }}
        >
          문의하기
        </Button>
      </Box>

      {/* 문의 폼 */}
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            width: '340px',
            borderRadius: '20px',
            bgcolor: 'white',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            bgcolor: '#f8f9fa',
            p: 2.5,
            borderBottom: '1px solid #eee'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 500,
              color: '#343959',
              textAlign: 'center'
            }}>
              지금 문의하세요.
            </Typography>
            <IconButton 
              onClick={() => setIsOpen(false)}
              sx={{ 
                position: 'absolute',
                right: 8,
                top: 8,
                color: '#666'
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                placeholder="회사명 또는 담당자 이름"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                size="small"
                required
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8f9fa',
                    borderRadius: '10px',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#343959',
                    },
                  }
                }}
              />
              
              <TextField
                fullWidth
                placeholder="담당자 연락처"
                value={formData.phone}
                onChange={handlePhoneChange}
                size="small"
                required
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8f9fa',
                    borderRadius: '10px',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#343959',
                    },
                  }
                }}
              />
              
              <TextField
                fullWidth
                placeholder="문의내용을 적어주시면 맞춤 상담 해드립니다."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                multiline
                rows={4}
                required
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8f9fa',
                    borderRadius: '10px',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#343959',
                    },
                  }
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreement}
                    onChange={(e) => setFormData({ ...formData, agreement: e.target.checked })}
                    sx={{
                      color: '#343959',
                      '&.Mui-checked': {
                        color: '#343959',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                    개인정보 처리방침에 동의합니다. [상세보기]
                  </Typography>
                }
                sx={{ mb: 2 }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#343959',
                  '&:hover': { bgcolor: '#3d63b8' },
                  borderRadius: '10px',
                  py: 1.5,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  fontWeight: 500
                }}
              >
                문의사항 전송하기
              </Button>
            </form>
          </Box>
        </Paper>
      </Slide>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ContactForm; 