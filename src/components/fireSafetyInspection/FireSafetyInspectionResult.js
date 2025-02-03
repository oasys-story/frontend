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
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { PDFDownloadLink } from '@react-pdf/renderer';
import FireSafetyInspectionPDF from './FireSafetyInspectionPDF';
import SignatureDialog from '../inspection/SignatureDialog';

const FireSafetyInspectionResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchInspectionData();
    checkPermission();
  }, [id]);

  const checkPermission = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setHasPermission(userData.role === 'ADMIN' || userData.role === 'MANAGER');
      }
    } catch (error) {
      console.error('권한 체크 실패:', error);
    }
  };

  const fetchInspectionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/fire-inspections/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInspection(data);
      } else {
        console.error('데이터 로딩 실패');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const token = localStorage.getItem('token');
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
        console.error('삭제 실패:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const handleSignatureComplete = async (signatureData) => {
    try {
      const token = localStorage.getItem('token');
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
      console.error('서명 저장 실패:', error);
      alert('서명 저장 중 오류가 발생했습니다.');
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
              <Typography variant="subtitle2" gutterBottom>관리자 서명</Typography>
              {inspection.managerSignature ? (
                <Box
                  component="img"
                  src={inspection.managerSignature.startsWith('data:') 
                    ? inspection.managerSignature
                    : `http://localhost:8080/uploads/signatures/${inspection.managerSignature}`
                  }
                  alt="관리자 서명"
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
                  onClick={() => 
                    hasPermission 
                      ? setSignatureDialogOpen(true) 
                      : alert('관리자만 서명할 수 있습니다.')
                  }
                  sx={{ 
                    width: '100%', 
                    height: '100px', 
                    border: '1px dashed #1C243A',
                    borderRadius: 1,
                    mt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: hasPermission ? 'pointer' : 'not-allowed',
                    opacity: hasPermission ? 1 : 0.6,
                    '&:hover': {
                      bgcolor: hasPermission ? 'rgba(28, 36, 58, 0.04)' : undefined
                    }
                  }}
                >
                  <Typography color="primary">
                    {hasPermission ? '서명하기' : '관리자 전용'}
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

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <PDFDownloadLink 
            document={<FireSafetyInspectionPDF inspection={inspection} />}
            fileName={`fire_safety_inspection_${id}.pdf`}
            style={{ textDecoration: 'none' }}
          >
            {({ loading: pdfLoading }) => 
              pdfLoading ? (
                <Button
                  variant="contained"
                  disabled
                  startIcon={<CircularProgress size={20} />}
                  sx={{ minWidth: '200px' }}
                >
                  PDF 생성중...
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdfIcon />}
                  sx={{ 
                    minWidth: '200px',
                    bgcolor: '#1C243A',
                    '&:hover': { bgcolor: '#3d63b8' }
                  }}
                >
                  PDF 다운로드
                </Button>
              )
            }
          </PDFDownloadLink>
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
          <>
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
            {/* <Button
              variant="outlined"
              onClick={handleDelete}
              sx={{ 
                minWidth: '100px',
                color: 'error.main',
                borderColor: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.light',
                  color: 'white'
                }
              }}
            >
              삭제
            </Button> */}
          </>
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
                console.error('Failed to load large image:', selectedImage);
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
    </Box>
  );
};

export default FireSafetyInspectionResult; 