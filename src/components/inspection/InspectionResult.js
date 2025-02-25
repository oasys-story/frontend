import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Grid,
  Paper,
  ImageList,
  ImageListItem,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import SignatureDialog from './SignatureDialog';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import InspectionPDF from './InspectionPdf';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import EmailIcon from '@mui/icons-material/Email';

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
  const [sending, setSending] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const checklistLabels = {

    // 저압설비
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
    otherEquipment: '기타설비',
  
    // 고압설비비
    aerialLine: '가공전선로',
    undergroundWireLine: '지중전선로',
    powerSwitch: '수배전용 개폐기',
    busbar: '배선(모선)',
    lightningArrester: '피뢰기',
    transformer: '변성기',
    powerFuse: '전력 퓨즈',
    powerTransformer: '변압기',
    incomingPanel: '수배전반',
    relay: '계전기류',
    circuitBreaker: '차단기류',
    powerCapacitor: '전력용 콘덴서',
    protectionEquipment: '보호설비',
    loadEquipment: '부하 설비',
    groundingSystem: '접지 설비'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/inspections/${id}/detail`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const inspectionData = await response.json();
          if (typeof inspectionData.measurements === 'string') {
            inspectionData.measurements = JSON.parse(inspectionData.measurements);
          }
          if (!inspectionData.measurements) {
            inspectionData.measurements = [];
          }
          setData(inspectionData);
          if (inspectionData.phoneNumber) {
            setPhoneNumber(inspectionData.phoneNumber);
          }
        } else {
          setError('데이터를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    // 컴포넌트 마운트 시 ADMIN 권한 체크
    const userRole = sessionStorage.getItem('role');
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

  const handleSendSMS = async () => {
    if (!phoneNumber) {
      alert('전화번호를 입력해주세요.');
      return;
    }

    if (!window.confirm('입력하신 번호로 알림톡을 전송하시겠습니까?')) {
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`http://localhost:8080/api/kakao-alert/inspection/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/-/g, '')
        })
      });

      if (response.ok) {
        alert('알림톡이 전송되었습니다.');
        setSmsDialogOpen(false);
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      console.error('알림톡 전송 실패:', error);
      alert('알림톡 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  // 관리자 서명 저장 핸들러
  const handleManagerSignature = async (signatureData) => {
    try {
      const response = await fetch(`http://localhost:8080/api/inspections/${id}/manager-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
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

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!hasPermission) {
      alert('삭제 권한이 없습니다.');
      return;
    }

    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/inspections/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          alert('점검 기록이 삭제되었습니다.');
          navigate('/inspections');
        } else {
          throw new Error('삭제 실패');
        }
      } catch (error) {
        console.error('Failed to delete inspection:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
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

  const InspectionSection = () => {
    const lowVoltageItems = [
      'wiringInlet', 'distributionPanel', 'moldedCaseBreaker', 'earthLeakageBreaker', 
      'switchGear', 'wiring', 'motor', 'heatingEquipment', 'welder', 'capacitor', 
      'lighting', 'grounding', 'internalWiring', 'generator', 'otherEquipment'
    ];

    const highVoltageItems = [
      'aerialLine', 'undergroundWireLine', 'powerSwitch', 'busbar', 'lightningArrester',
      'transformer', 'powerFuse', 'powerTransformer', 'incomingPanel', 'relay',
      'circuitBreaker', 'powerCapacitor', 'protectionEquipment', 'loadEquipment', 'groundingSystem'
    ];

    const getStatusChip = (status) => {
      const statusColors = {
        'O': 'success',
        'X': 'error',
        '△': 'warning',
        '/': 'default'
      };
      
      const statusLabels = {
        'O': '적합',
        'X': '부적합',
        '△': '보통',
        '/': '해당없음'
      };

      return (
        <Chip 
          label={statusLabels[status]} 
          color={statusColors[status]} 
          size="small"
          sx={{ minWidth: '80px' }}
        />
      );
    };

    return (
      <Box sx={{ width: '100%' }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="저압설비" />
          <Tab label="고압설비" />
        </Tabs>

        {selectedTab === 0 && (
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">저압설비 점검내역</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {lowVoltageItems.map((item) => (
                  <Box
                    key={item}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.5,
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    <Typography variant="body2">{checklistLabels[item]}</Typography>
                    {getStatusChip(data[item])}
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {selectedTab === 1 && (
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">고압설비 점검내역</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {highVoltageItems.map((item) => (
                  <Box
                    key={item}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.5,
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    <Typography variant="body2">{checklistLabels[item]}</Typography>
                    {getStatusChip(data[item])}
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    );
  };

  // 직원 목록 조회 함수
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/companies/${data?.companyId}/employees`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.filter(emp => emp.active));
      }
    } catch (error) {
      console.error('직원 정보 조회 실패:', error);
    }
  };

  // SMS 다이얼로그가 열릴 때 직원 목록 조회
  useEffect(() => {
    if (smsDialogOpen && data?.companyId) {
      fetchEmployees();
    }
  }, [smsDialogOpen, data?.companyId]);

  // PDF Blob 생성 함수 추가
  const generatePdfBlob = async () => {
    const pdfDoc = <InspectionPDF 
      data={data} 
      checklistLabels={checklistLabels}
      getStatusText={getStatusText}
    />;
    const blob = await pdf(pdfDoc).toBlob();
    return blob;
  };

  // 이메일 전송 함수 추가
  const handleSendEmail = async () => {
    if (!email) {
      alert('이메일 주소를 입력해주세요.');
      return;
    }

    setSendingEmail(true);
    try {
      const pdfBlob = await generatePdfBlob();
      
      const formData = new FormData();
      formData.append('to', email);
      formData.append('subject', `[전기점검결과] ${data.companyName}`);
      formData.append('content', `
        점검일자: ${new Date(data.inspectionDate).toLocaleDateString()}
        건물명: ${data.companyName}
        주소: ${data.managerName}
        점검결과: 자세한 내용은 첨부된 PDF를 확인해주세요.
      `);
      formData.append('attachment', pdfBlob, `${data.companyName}_전기점검결과.pdf`);

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
        setEmail('');  // 이메일 입력 초기화
      } else {
        throw new Error('이메일 전송에 실패했습니다.');
      }
    } catch (error) {
      alert('이메일 전송 중 오류가 발생했습니다.');
      console.error('이메일 전송 오류:', error);
    } finally {
      setSendingEmail(false);
    }
  };

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

  // 권한 체크
  const currentUserId = sessionStorage.getItem('userId');
  
  // 수정/삭제 권한 체크
  const hasPermission = isAdmin || (data?.userId === parseInt(currentUserId));

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
              <Typography variant="body2" color="text.secondary">점검일자</Typography>
              <Typography>{new Date(data.inspectionDate).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">점검자</Typography>
              <Typography>{data.managerName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">작성자</Typography>
              <Typography>{data?.username}</Typography>
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
          <InspectionSection />
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
          {data?.measurements && Array.isArray(data.measurements) && data.measurements.map((measurement, index) => (
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
              {[...new Set(data.images)].map((imageName, index) => (
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
                    onError={(e) => {
                      console.error('Failed to load image:', imageName);
                      e.target.src = '/placeholder-image.png';
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
                    ? data.signature
                    : `http://localhost:8080/uploads/signatures/${data.signature}`
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
              <Typography variant="body2" color="text.secondary">업체 서명</Typography>
              {data.managerSignature ? (
                <Box
                  component="img"
                  src={data.managerSignature.startsWith('data:') 
                    ? data.managerSignature
                    : `http://localhost:8080/uploads/signatures/${data.managerSignature}`
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

        {/* PDF 다운로드, 문자 전송, 이메일 전송 버튼 */}
        <Box sx={{ 
          mt: 3, 
          mb: 10,
          display: 'flex', 
          gap: 1,  // 간격을 더 줄임
          justifyContent: 'center',
          px: 2
        }}>
          <PDFDownloadLink 
            document={
              <InspectionPDF 
                data={data} 
                checklistLabels={checklistLabels}
                getStatusText={getStatusText}
              />
            } 
            fileName={`${data.companyName}_전기점검결과.pdf`}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <Button
                variant="outlined"
                startIcon={<PictureAsPdfIcon />}
                disabled={loading}
                size="small"
                sx={{ 
                  borderColor: '#343959',
                  color: '#343959',
                  minWidth: '90px',  // 너비 더 축소
                  fontSize: '0.8rem',  // 글씨 크기 더 축소
                  py: 0.5,  // 상하 패딩 축소
                  '& .MuiButton-startIcon': {  // 아이콘 크기 조정
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
            size="small"
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
            알림톡
          </Button>

          <Button
            onClick={() => setEmailDialogOpen(true)}
            startIcon={<EmailIcon />}
            variant="outlined"
            size="small"
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

      {/* 하단 버튼 */}
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
          onClick={() => navigate('/inspections')}
          sx={{ minWidth: '100px' }}
        >
          목록
        </Button>
        {hasPermission && (
          <>
            <Button
              variant="contained"
              onClick={() => navigate(`/inspection/edit/${id}`)}
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

      {/* SMS 다이얼로그 */}
      <Dialog open={smsDialogOpen} onClose={() => !sending && setSmsDialogOpen(false)}>
        <DialogTitle sx={{ 
          bgcolor: '#f8f9fa',
          p: 2.5,
          borderBottom: '1px solid #eee',
          textAlign: 'center',
          position: 'relative'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: '#343959' }}>
            점검 결과 알림톡 전송
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* 직원 선택 Select */}
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

            {/* 구분선 */}
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

            {/* 직접 입력 */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              직접 입력
            </Typography>
            <TextField
              margin="dense"
              label="전화번호"
              type="tel"
              fullWidth
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              disabled={sending}
              placeholder="010-0000-0000"
              helperText="'-' 없이 입력해주세요."
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
            {sending ? '전송중...' : '전송하기'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 관리자 서명 다이얼로그 */}
      <SignatureDialog
        open={signatureDialogOpen}
        onClose={() => setSignatureDialogOpen(false)}
        onConfirm={handleManagerSignature}
      />

      {/* 이미지 상세보기 모달 */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="상세 이미지"
              style={{ width: '100%', height: 'auto' }}
              onError={(e) => {
                console.error('Failed to load large image:', selectedImage);
                e.target.src = '/placeholder-image.png';
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 이메일 전송 다이얼로그 추가 */}
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
              dawoo4850@naver.com
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

export default InspectionResult; 