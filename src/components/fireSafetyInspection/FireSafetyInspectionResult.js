import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContentText,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import FireSafetyInspectionPDF from './FireSafetyInspectionPDF';
import SignatureDialog from '../inspection/SignatureDialog';
import ShareIcon from '@mui/icons-material/Share';
import EmailIcon from '@mui/icons-material/Email';

const FireSafetyInspectionResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sending, setSending] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await fetchInspectionData();
      await checkPermission();
    };
    initialize();
  }, [id]);

  const checkPermission = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setCurrentUserId(userData.userId);
        setIsAdmin(userData.role === 'ADMIN');
      }
    } catch (error) {
      setHasPermission(false);
    }
  };

  const fetchInspectionData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/fire-inspections/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInspection(data);
        if (data.phoneNumber) {
          setPhoneNumber(data.phoneNumber);
        }
        
        const currentUser = await getCurrentUser();
        const hasPermission = currentUser.role === 'ADMIN' || 
                            data.writerId === currentUser.userId;
        setHasPermission(hasPermission);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = async () => {
    const token = sessionStorage.getItem('token');
    const response = await fetch('http://localhost:8080/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to get current user');
  };

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/fire-inspections/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          navigate('/fire-safety-inspections');
        }
      } catch (error) {
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const handleSignatureComplete = async (signatureData) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/fire-inspections/${id}/manager-signature`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ signature: signatureData })
      });

      if (response.ok) {
        const updatedData = await response.json();
        setInspection(updatedData);
        setSignatureDialogOpen(false);
      } else {
        alert('서명 저장에 실패했습니다.');
      }
    } catch (error) {
      alert('서명 저장 중 오류가 발생했습니다.');
    }
  };

  const handleSendSMS = async () => {
    if (!phoneNumber) {
      alert('전화번호를 입력해주세요.');
      return;
    }

    try {
      setSending(true);
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/kakao-alert/fire-safety-inspection/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/-/g, '')  // 하이픈 제거
        })
      });

      if (response.ok) {
        alert('문자가 전송되었습니다.');
        setSmsDialogOpen(false);
        setPhoneNumber('');
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      alert('문자 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/companies/${inspection?.companyId}/employees`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.filter(emp => emp.active));
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    if (smsDialogOpen && inspection?.companyId) {
      fetchEmployees();
    }
  }, [smsDialogOpen, inspection?.companyId]);

  const generatePdfBlob = async () => {
    const pdfDoc = <FireSafetyInspectionPDF inspection={inspection} />;
    const blob = await pdf(pdfDoc).toBlob();
    return blob;
  };

  const handleSendEmail = async () => {
    if (!email) {
      alert('이메일 주소를 입력해주세요.');
      return;
    }

    setSendingEmail(true);
    try {
      // PDF 생성
      const pdfBlob = await generatePdfBlob();
      
      // FormData 생성
      const formData = new FormData();
      formData.append('to', email);
      formData.append('subject', `[소방점검결과] ${inspection.buildingName}`);
      formData.append('content', `
        점검일자: ${new Date(inspection.inspectionDate).toLocaleDateString()}
        건물명: ${inspection.buildingName}
        주소: ${inspection.address}
        점검결과: 자세한 내용은 첨부된 PDF를 확인해주세요.
      `);
      formData.append('attachment', pdfBlob, `${inspection.buildingName}_소방점검결과.pdf`);

      const response = await fetch('http://localhost:8080/api/email/send-with-attachment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        alert('이메일이 성공적으로 전송되었습니다.');
        setEmailDialogOpen(false);
      } else {
        throw new Error('이메일 전송에 실패했습니다.');
      }
    } catch (error) {
      alert('이메일 전송 중 오류가 발생했습니다.');

    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>로딩 중...</Box>;
  }

  if (!inspection) {
    return <Box sx={{ p: 3 }}>데이터를 찾을 수 없습니다.</Box>;
  }

  return (
    <Box sx={{ pb: 10 }}>
      <Box sx={{ 
        position: 'sticky',   
        top: 0, 
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #eee',
        zIndex: 1,
        p: 2,
        textAlign: 'center'
      }}>
        <Typography variant="h6">점검 결과</Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>기본 정보</Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography color="textSecondary">점검일자</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{formatDate(inspection.inspectionDate)}</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography color="textSecondary">업체명</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{inspection.companyName}</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography color="textSecondary">건물명</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{inspection.buildingName}</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography color="textSecondary">주소</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{inspection.address}</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography color="textSecondary">건물등급</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{inspection.buildingGrade}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>점검 상태</Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>소화설비 상태</Typography>
            <Typography color="textSecondary">{inspection.fireExtinguisherStatus}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>경보설비 상태</Typography>
            <Typography color="textSecondary">{inspection.fireAlarmStatus}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>피난구조설비 상태</Typography>
            <Typography color="textSecondary">{inspection.fireEvacuationStatus}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>소화용수설비 상태</Typography>
            <Typography color="textSecondary">{inspection.fireWaterStatus}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>소화활동설비 상태</Typography>
            <Typography color="textSecondary">{inspection.fireFightingStatus}</Typography>
          </Box>

          {inspection.etcComment && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle2" gutterBottom>기타 의견</Typography>
                <Typography color="textSecondary">{inspection.etcComment}</Typography>
              </Box>
            </>
          )}
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>서명</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" gutterBottom>점검자 서명</Typography>
              {inspection.inspectorSignature && (
                <Box
                  component="img"
                  src={inspection.inspectorSignature}
                  alt="점검자 서명"
                  sx={{ width: '100%', maxHeight: '100px', objectFit: 'contain' }}
                />
              )}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" gutterBottom>업체 서명</Typography>
              {inspection.managerSignature ? (
                <Box
                  component="img"
                  src={inspection.managerSignature.startsWith('data:') 
                    ? inspection.managerSignature
                    : `http://localhost:8080/uploads/signatures/${inspection.managerSignature}`
                  }
                  alt="업체 서명"
                  sx={{
                    width: '100%',
                    height: '100px',
                    objectFit: 'contain',
                    border: '1px solid #eee',
                    borderRadius: 1,
                    mt: 1
                  }}
                />
              ) : (
                <Box
                  onClick={() => setSignatureDialogOpen(true)}
                  sx={{ 
                    width: '100%', 
                    height: '100px', 
                    border: '1px dashed #343959',
                    borderRadius: 1,
                    mt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(52, 57, 89, 0.04)'
                    }
                  }}
                >
                  <Typography color="primary">
                    서명하기
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>첨부 이미지</Typography>
          <Grid container spacing={2}>
            {inspection.attachments.map((image, index) => (
              <Grid item xs={6} key={index}>
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '100%', // 1:1 비율 유지
                    width: '100%',
                    overflow: 'hidden',
                    borderRadius: 1,
                  }}
                >
                  <Box
                    component="img"
                    src={`http://localhost:8080/uploads/fire-safety-images/${image}`}
                    alt={`점검 이미지 ${index + 1}`}
                    onClick={() => setSelectedImage(`http://localhost:8080/uploads/fire-safety-images/${image}`)}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover', // 이미지 비율 유지하면서 영역 채우기
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)'
                      }
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Box sx={{ 
          mt: 3, 
          mb: 10,  // 하단 고정 버튼과 겹치지 않도록 마진 추가
          display: 'flex', 
          gap: 2, 
          justifyContent: 'center' 
        }}>
          <PDFDownloadLink 
            document={<FireSafetyInspectionPDF inspection={inspection} />}
            fileName={`${inspection.buildingName}_소방점검결과.pdf`}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <Button
                variant="outlined"
                startIcon={<PictureAsPdfIcon />}
                disabled={loading}
                sx={{ 
                  borderColor: '#343959',
                  color: '#343959',
                  minWidth: '90px',
                  fontSize: '0.8rem',
                  py: 0.5,
                  '& .MuiButton-startIcon': {
                    marginRight: 0.5,
                    '& > *:first-of-type': {
                      fontSize: '1.1rem'
                    }
                  },
                  '&:hover': {
                    borderColor: '#3d63b8',
                    color: '#3d63b8',
                    bgcolor: 'rgba(61, 99, 184, 0.04)'
                  }
                }}
              >
                PDF
              </Button>
            )}
          </PDFDownloadLink>

          <Button
            onClick={() => setSmsDialogOpen(true)}
            startIcon={<ShareIcon />}
            variant="outlined"
            sx={{ 
              borderColor: '#343959',
              color: '#343959',
              minWidth: '90px',
              fontSize: '0.8rem',
              py: 0.5,
              '& .MuiButton-startIcon': {
                marginRight: 0.5,
                '& > *:first-of-type': {
                  fontSize: '1.1rem'
                }
              },
              '&:hover': {
                borderColor: '#3d63b8',
                color: '#3d63b8',
                bgcolor: 'rgba(61, 99, 184, 0.04)'
              }
            }}
          >
            문자
          </Button>

          <Button
            onClick={() => setEmailDialogOpen(true)}
            startIcon={<EmailIcon />}
            variant="outlined"
            sx={{ 
              borderColor: '#343959',
              color: '#343959',
              minWidth: '90px',
              fontSize: '0.8rem',
              py: 0.5,
              '& .MuiButton-startIcon': {
                marginRight: 0.5,
                '& > *:first-of-type': {
                  fontSize: '1.1rem'
                }
              },
              '&:hover': {
                borderColor: '#3d63b8',
                color: '#3d63b8',
                bgcolor: 'rgba(61, 99, 184, 0.04)'
              }
            }}
          >
            이메일
          </Button>
        </Box>
      </Box>

      <Box sx={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        bgcolor: 'white',
        borderTop: '1px solid #eee',
        display: 'flex',
        gap: 1,
        justifyContent: 'center'
      }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/fire-safety-inspections')}
          sx={{ minWidth: '100px' }}
        >
          목록
        </Button>
        {hasPermission && (
          <Button
            variant="contained"
            onClick={() => navigate(`/fire-safety-inspection/edit/${inspection.fireInspectionId}`)}
            sx={{ 
              minWidth: '100px',
              bgcolor: '#1C243A',
              '&:hover': { bgcolor: '#3d63b8' }
            }}
          >
            수정
          </Button>
        )}
      </Box>

      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            m: 0,
            p: 1
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="상세 이미지"
              style={{ 
                width: '100%', 
                height: 'auto',
                borderRadius: '4px'
              }}
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <SignatureDialog
        open={signatureDialogOpen}
        onClose={() => setSignatureDialogOpen(false)}
        onConfirm={handleSignatureComplete}
      />

      <Dialog open={smsDialogOpen} onClose={() => !sending && setSmsDialogOpen(false)}>
        <DialogTitle sx={{ 
          bgcolor: '#f8f9fa',
          p: 2.5,
          borderBottom: '1px solid #eee',
          textAlign: 'center',
          position: 'relative'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: '#343959' }}>
            점검 결과 공유하기
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="employee-select-label">전송할 직원 선택</InputLabel>
              <Select
                labelId="employee-select-label"
                value={selectedEmployee ? selectedEmployee.employeeId : ''}
                onChange={(e) => {
                  const selected = employees.find(emp => emp.employeeId === e.target.value);
                  setSelectedEmployee(selected);
                  setPhoneNumber(selected ? selected.phone : '');
                }}
                label="전송할 직원 선택"
                sx={{
                  bgcolor: '#f8f9fa',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#343959'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#343959'
                  }
                }}
              >
                <MenuItem value="" sx={{ color: '#666' }}>
                  <em>직원 선택</em>
                </MenuItem>
                {employees.map((employee) => (
                  <MenuItem 
                    key={employee.employeeId} 
                    value={employee.employeeId}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 1
                    }}
                  >
                    <Typography>{employee.name}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {employee.phone}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              my: 2,
              color: '#666'
            }}>
              <Divider sx={{ flex: 1 }} />
              <Typography variant="body2" sx={{ mx: 1 }}>또는</Typography>
              <Divider sx={{ flex: 1 }} />
            </Box>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              직접 입력
            </Typography>
            <TextField
              margin="dense"
              label="전화번호"
              type="tel"
              fullWidth
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={sending}
              placeholder="010-0000-0000"
              helperText="'-' 없이 입력해도 됩니다."
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f8f9fa'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Button 
            onClick={() => setSmsDialogOpen(false)} 
            disabled={sending}
            sx={{ color: '#666' }}
          >
            취소
          </Button>
          <Button 
            onClick={handleSendSMS} 
            variant="contained"
            disabled={sending || !phoneNumber}
            sx={{ 
              bgcolor: '#343959',
              '&:hover': { bgcolor: '#3d63b8' }
            }}
          >
            {sending ? '전송중...' : '전송'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>이메일 전송</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#666', mb: 0.5 }}>
              발송 이메일
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#343959',
                fontWeight: 500,
                bgcolor: '#f8f9fa',
                p: 1,
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}
            >
              bjh7340@naver.com
            </Typography>
          </Box>
          <DialogContentText sx={{ mb: 2 }}>
            점검 결과를 전송할 이메일 주소를 입력해주세요.
          </DialogContentText>
          <TextField
            fullWidth
            label="이메일 주소"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={sendingEmail}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Button 
            onClick={() => setEmailDialogOpen(false)} 
            disabled={sendingEmail}
            sx={{ color: '#666' }}
          >
            취소
          </Button>
          <Button 
            onClick={handleSendEmail} 
            variant="contained"
            disabled={sendingEmail}
            sx={{ 
              bgcolor: '#343959',
              '&:hover': { bgcolor: '#3d63b8' }
            }}
          >
            {sendingEmail ? '전송중...' : '전송'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FireSafetyInspectionResult; 