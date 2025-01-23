import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Grid,
  Paper,
  ImageList,
  ImageListItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import HomeIcon from '@mui/icons-material/Home';
import ListIcon from '@mui/icons-material/List';
import SignatureDialog from './SignatureDialog';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const InspectionResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const checklistLabels = {
    wiringInlet: '인입구 배선',
    distributionPanel: '배·분전반',
    moldedCaseBreaker: '배선용 차단기',
    earthLeakageBreaker: '누전 차단기',
    switchGear: '개폐기',
    wiring: '배선',
    motor: '전동기',
    heatingEquipment: '전열설비',
    welder: '용접기',
    capacitor: '콘덴서',
    lighting: '조명설비',
    grounding: '접지설비',
    internalWiring: '구내 전선로',
    generator: '발전기',
    otherEquipment: '기타설비'
  };

  useEffect(() => {
    const fetchInspectionDetail = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/inspections/${id}/detail`);
        if (!response.ok) {
          throw new Error('점검 데이터를 불러오는데 실패했습니다.');
        }
        const fetchedData = await response.json();
        if (typeof fetchedData.measurements === 'string') {
          fetchedData.measurements = JSON.parse(fetchedData.measurements);
        }
        setData(fetchedData);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInspectionDetail();
  }, [id]);

  useEffect(() => {
    // 컴포넌트 마운트 시 ADMIN 권한 체크
    const userRole = localStorage.getItem('role');
    setIsAdmin(userRole === 'ADMIN');
  }, []);

  const formatPhoneNumber = (value) => { // 전화번호 포맷 처리
    // 숫자만 추출
    const number = value.replace(/[^\d]/g, '');
    // 길이에 따라 하이픈 추가
    if (number.length <= 3) return number; 
    if (number.length <= 7) return number.slice(0, 3) + '-' + number.slice(3); 
    return number.slice(0, 3) + '-' + number.slice(3, 7) + '-' + number.slice(7, 11);
  };

  const handlePhoneNumberChange = (e) => { // 전화번호 입력 폼 처리
    const formattedNumber = formatPhoneNumber(e.target.value);
    if (formattedNumber.length <= 13) { // 010-1234-5678 형식의 최대 길이
      setPhoneNumber(formattedNumber);
    }
  };

  const handleSendSms = async () => {
    // 하이픈과 공백을 모두 제거하고 국제 형식으로 변환
    const internationalNumber = '+82' + phoneNumber.replace(/[-\s]/g, '').replace(/^0/, '');
    try {
      const response = await fetch(
        `http://localhost:8080/api/inspections/${id}/send-sms?phoneNumber=${internationalNumber}`,
        { method: 'POST' }
      );
      
      if (response.ok) { // 전송 성공 여부 확인
        alert('점검 결과가 전송되었습니다.');
        setSmsDialogOpen(false); // SMS 전송 다이얼로그 닫기
      } else {
        const errorText = await response.text(); 
        throw new Error(errorText || '전송에 실패했습니다.'); 
      }
    } catch (error) {
      alert(error.message || '메시지 전송 중 오류가 발생했습니다.'); 
      console.error(error);
    }
  };

  // 관리자 서명 저장 핸들러
  const handleManagerSignature = async (signatureData) => {
    try {
      const response = await fetch(`http://localhost:8080/api/inspections/${id}/manager-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ signature: signatureData })
      });

      if (response.ok) {
        setSignatureDialogOpen(false);
        // 페이지 새로고침
        window.location.reload();
      } else {
        throw new Error('서명 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const handlePdfDownload = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/inspections/${id}/pdf`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('PDF 생성에 실패했습니다.');
      }

      // PDF 파일 다운로드
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inspection_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const ResultSection = ({ title, children }) => ( // 점검 결과 섹션 컴포넌트
    <Box sx={{ mb: 3 }}>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          fontWeight: 600, 
          color: '#1C243A',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>데이터를 찾을 수 없습니다.</Typography>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'O': return 'success';
      case 'X': return 'error';
      case '/': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status) => { // 점검 결과 상태 텍스트 처리
    switch(status) {
      case 'O': return '적합';
      case 'X': return '부적합';
      case '/': return '해당없음';
      default: return '-';
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#FFFFFF',
      pb: 10
    }}>
      {/* 헤더 */}
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

      {/* 컨텐츠 영역 */}
      <Box sx={{ p: 2 }}>
        {/* 기본 정보 */}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ 
            color: '#1C243A',
            fontWeight: 600,
            pb: 1,
            mb: 2,
            borderBottom: '2px solid #1C243A'
          }}>
            기본 정보
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">업체명</Typography>
              <Typography>{data.companyName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">점검일</Typography>
              <Typography>{new Date(data.inspectionDate).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">점검자</Typography>
              <Typography>{data.managerName}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* 기본사항 */}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ 
            color: '#1C243A',
            fontWeight: 600,
            pb: 1,
            mb: 2,
            borderBottom: '2px solid #1C243A'
          }}>
            기본사항
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">수전전압</Typography>
              <Typography>{data.faucetVoltage}V</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">수전용량</Typography>
              <Typography>{data.faucetCapacity}kW</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">발전전압</Typography>
              <Typography>{data.generationVoltage}V</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">발전용량</Typography>
              <Typography>{data.generationCapacity}kW</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">태양광</Typography>
              <Typography>{data.solarCapacity}kW</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">계약용량</Typography>
              <Typography>{data.contractCapacity}kW</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">점검종별</Typography>
              <Typography>{data.inspectionType}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">점검횟수</Typography>
              <Typography>{data.inspectionCount}회</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* 점검내역 */}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ 
            color: '#1C243A',
            fontWeight: 600,
            pb: 1,
            mb: 2,
            borderBottom: '2px solid #1C243A'
          }}>
            점검내역
          </Typography>
          {Object.entries(checklistLabels).map(([key, label]) => (
            <Box key={key} sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: 1.5,
              borderBottom: '1px solid #eee'
            }}>
              <Typography variant="body1">{label}</Typography>
              <Chip 
                label={getStatusText(data[key])}
                color={getStatusColor(data[key])}
                size="small"
                sx={{ 
                  minWidth: 60,
                  height: 24
                }}
              />
            </Box>
          ))}
        </Paper>

        {/* 측정개소 */}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ 
            color: '#1C243A',
            fontWeight: 600,
            pb: 1,
            mb: 2,
            borderBottom: '2px solid #1C243A'
          }}>
            측정개소
          </Typography>
          {data.measurements && data.measurements.map((measurement, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                측정개소 {measurement.measurementNumber}
              </Typography>
              <Box sx={{ 
                border: '1px solid #eee',
                borderRadius: 1,
                overflow: 'hidden'
              }}>
                {/* 테이블 헤더 */}
                <Grid container sx={{ borderBottom: '1px solid #eee', bgcolor: '#f8f9fa' }}>
                  <Grid item xs={3} sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">구분</Typography>
                  </Grid>
                  <Grid item xs={3} sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">전압(V)</Typography>
                  </Grid>
                  <Grid item xs={3} sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">전류(A)</Typography>
                  </Grid>
                  <Grid item xs={3} sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">온도(℃)</Typography>
                  </Grid>
                </Grid>
                {/* 측정값 행 */}
                {['A', 'B', 'C', 'N'].map((phase) => (
                  <Grid container key={phase} sx={{ 
                    borderBottom: '1px solid #eee',
                    '&:last-child': { borderBottom: 'none' }
                  }}>
                    <Grid item xs={3} sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="body2">{phase !== 'N' ? `${phase}-` : phase}</Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="body2">{measurement[`voltage${phase}`]}</Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="body2">{measurement[`current${phase}`]}</Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="body2">{measurement[`temperature${phase}`]}</Typography>
                    </Grid>
                  </Grid>
                ))}
              </Box>
            </Box>
          ))}
        </Paper>

        {/* 특이사항 */}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ 
            color: '#1C243A',
            fontWeight: 600,
            pb: 1,
            mb: 2,
            borderBottom: '2px solid #1C243A'
          }}>
            특이사항
          </Typography>
          <Typography paragraph>
            {data.specialNotes || '없음'}
          </Typography>
        </Paper>

        {/* 첨부 이미지 섹션 */}
        {data.images && data.images.length > 0 && (
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ 
              color: '#1C243A',
              fontWeight: 600,
              pb: 1,
              mb: 2,
              borderBottom: '2px solid #1C243A'
            }}>
              첨부 이미지
            </Typography>
            <ImageList sx={{ width: '100%', height: 'auto' }} cols={2} rowHeight={164}>
              {data.images.map((imageName, index) => (
                <ImageListItem 
                  key={index}
                  onClick={() => setSelectedImage(`http://localhost:8080/uploads/images/${imageName}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <img
                    src={`http://localhost:8080/uploads/images/${imageName}`}
                    alt={`첨부 이미지 ${index + 1}`}
                    loading="lazy"
                    style={{ 
                      height: '100%', 
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Paper>
        )}

        {/* 서명 영역 */}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ 
            color: '#1C243A',
            fontWeight: 600,
            pb: 1,
            mb: 2,
            borderBottom: '2px solid #1C243A'
          }}>
            서명
          </Typography>
          <Grid container spacing={2}>
            {/* 점검자 서명 */}
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">점검자 서명</Typography>
              {data.signature ? (
                <Box
                  component="img"
                  src={data.signature.startsWith('data:') 
                    ? data.signature  // Base64 데이터인 경우 직접 사용
                    : `http://localhost:8080/uploads/signatures/${data.signature}`  // 파일 경로인 경우
                  }
                  alt="점검자 서명"
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
                <Box sx={{ 
                  width: '100%', 
                  height: '100px', 
                  border: '1px solid #eee',
                  borderRadius: 1,
                  mt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography color="text.secondary">서명 없음</Typography>
                </Box>
              )}
            </Grid>
            
            {/* 관리자 서명 */}
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">관리자 서명</Typography>
              {data.managerSignature ? (
                <Box
                  component="img"
                  src={data.managerSignature.startsWith('data:') 
                    ? data.managerSignature
                    : `http://localhost:8080/uploads/signatures/${data.managerSignature}`
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
                  onClick={() => isAdmin ? setSignatureDialogOpen(true) : alert('관리자만 서명할 수 있습니다.')}
                  sx={{ 
                    width: '100%', 
                    height: '100px', 
                    border: '1px dashed #1C243A',
                    borderRadius: 1,
                    mt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isAdmin ? 'pointer' : 'not-allowed',
                    opacity: isAdmin ? 1 : 0.6,
                    '&:hover': {
                      bgcolor: isAdmin ? 'rgba(28, 36, 58, 0.04)' : undefined
                    }
                  }}
                >
                  <Typography color="primary">
                    {isAdmin ? '서명하기' : '관리자 전용'}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* 하단 버튼 */}
      <Box sx={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: '#FFFFFF',
        borderTop: '1px solid #eee',
        p: 2
      }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={handlePdfDownload}
              startIcon={<PictureAsPdfIcon />}
            >
              PDF 다운로드
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/inspections')}
              startIcon={<ListIcon />}
            >
              목록
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* SMS 다이얼로그 */}
      <Dialog open={smsDialogOpen} onClose={() => setSmsDialogOpen(false)}>
        <DialogTitle>SMS 전송</DialogTitle>
        <DialogContent>
          <DialogContentText>
            점검 결과를 전송할 전화번호를 입력하세요.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="전화번호"
            type="tel"
            fullWidth
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder="010-0000-0000"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSmsDialogOpen(false)}>취소</Button>
          <Button 
            onClick={handleSendSms} 
            variant="contained"
            disabled={phoneNumber.length < 13}
          >
            전송
          </Button>
        </DialogActions>
      </Dialog>

      {/* 관리자 서명 다이얼로그 */}
      <SignatureDialog
        open={signatureDialogOpen}
        onClose={() => setSignatureDialogOpen(false)}
        onConfirm={handleManagerSignature}
      />

      {/* 이미지 확대 다이얼로그 추가 */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 1 }}>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="확대된 이미지"
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default InspectionResult; 