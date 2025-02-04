import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Container,
  Dialog,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useNavigate, useParams } from 'react-router-dom';
import SignatureDialog from '../inspection/SignatureDialog';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VoiceRecorder from '../inspection/VoiceRecorder';
import DeleteIcon from '@mui/icons-material/Delete';

const FireSafetyInspectionForm = () => {
  const { id } = useParams();  // URL에서 id 파라미터 가져오기
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState(false);  // 수정 모드 여부
  const [activeStep, setActiveStep] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [signatureType, setSignatureType] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    writerId: '',
    companyId: '',
    buildingName: '',
    inspectionDate: new Date(),
    address: '',
    buildingGrade: '',
    // 점검 상태 필드
    fireExtinguisherStatus: '',
    fireAlarmStatus: '',
    fireEvacuationStatus: '',
    fireWaterStatus: '',
    fireFightingStatus: '',
    etcComment: '',
    // 서명 필드
    inspectorSignature: '',
    managerSignature: '',
    // 첨부파일
    attachments: []
  });

  useEffect(() => {
    // id가 있으면 수정 모드로 데이터 불러오기
    if (id) {
      setIsEdit(true);
      fetchInspectionData();
    }
  }, [id]);

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
        // 기존 이미지 정보를 유지하면서 preview 추가
        const attachmentsWithPreview = data.attachments.map(path => ({
          isExisting: true,  // 기존 이미지 표시
          preview: `http://localhost:8080/uploads/fire-safety-images/${path}`,
          path: path  // 원본 경로 저장
        }));

        setFormData({
          ...data,
          inspectionDate: new Date(data.inspectionDate),
          attachments: attachmentsWithPreview
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // 사용자 정보와 회사 목록 조회
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 현재 로그인한 사용자 정보 가져오기
        const userResponse = await fetch('http://localhost:8080/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setFormData(prev => ({
            ...prev,
            writerId: userData.userId  // 사용자 ID 설정
          }));
        }

        // 회사 목록 가져오기
        const companiesResponse = await fetch('http://localhost:8080/api/companies', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (companiesResponse.ok) {
          const companiesData = await companiesResponse.json();
          setCompanies(companiesData);
        }
      } catch (error) {
        console.error('초기 데이터 로딩 실패:', error);
      }
    };

    fetchInitialData();
  }, []);

  // 단계별 제목
  const steps = ['기본 정보', '점검 상태', '이미지 첨부'];

  // 다음 단계로 이동
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };


  // 이전 단계로 이동
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // 파일 업로드 처리
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false  // 새로 추가된 이미지 표시
    }));

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  // 파일 삭제 처리
  const handleFileDelete = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // 확인 다이얼로그 열기
  const handleConfirmOpen = () => {
    setConfirmDialogOpen(true);
  };

  // 최종 제출 처리
  const handleFinalSubmit = async () => {
    setConfirmDialogOpen(false);
    setSignatureDialogOpen(true);
  };

  // 서명 완료 후 저장
  const handleSignatureComplete = async (signatureData) => {
    setSignatureDialogOpen(false);
    
    try {
      const token = localStorage.getItem('token');
      const formDataToSubmit = new FormData();
      
      // 기존 이미지 경로와 새 이미지 파일을 분리하여 처리
      const existingImages = formData.attachments
        .filter(att => att.isExisting)
        .map(att => att.path);

      const inspectionData = {
        ...formData,
        inspectionDate: formData.inspectionDate.toISOString(),
        inspectorSignature: signatureData,
        attachments: existingImages  // 기존 이미지 경로 전달
      };
      
      // 점검 데이터를 FormData에 추가
      formDataToSubmit.append('inspectionData', JSON.stringify(inspectionData));
      
      // 새로 추가된 이미지만 files로 전송
      const newImages = formData.attachments.filter(att => !att.isExisting);
      newImages.forEach(attachment => {
        if (attachment.file) {
          formDataToSubmit.append('images', attachment.file);
        }
      });

      const url = isEdit 
        ? `http://localhost:8080/api/fire-inspections/${id}`
        : 'http://localhost:8080/api/fire-inspections';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSubmit
      });

      if (response.ok) {
        const savedData = await response.json();
        navigate(`/fire-safety-inspection/${savedData.fireInspectionId}`);
      } else {
        const errorData = await response.text();
        throw new Error('저장 실패: ' + errorData);
      }
    } catch (error) {
      console.error('저장 실패:', error);
    }
  };

  return (
    <Container maxWidth="sm" disableGutters>
      {/* 헤더 */}
      <Box sx={{ 
        p: 2, 
        position: 'sticky',
        top: 0,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #EEEEEE',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            color: '#2A2A2A',
            textAlign: 'center'
          }}
        >
          {isEdit ? '소방점검 수정' : '소방점검 작성'}
        </Typography>
      </Box>

      {/* 점검 폼 */}
      <Paper sx={{ p: 2, backgroundColor: '#FFFFFF' }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                onClick={() => setActiveStep(index)}
                sx={{
                  cursor: 'pointer',
                  '& .MuiStepLabel-label': {
                    '&:hover': {
                      color: '#4B77D8',
                    }
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* 기본 정보 단계 */}
        {activeStep === 0 && (
          <Box sx={{ mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="점검일자"
                value={formData.inspectionDate}
                onChange={(date) => setFormData({...formData, inspectionDate: date})}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
            </LocalizationProvider>

            <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
              <InputLabel>업체 선택</InputLabel>
              <Select
                value={formData.companyId}
                onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                label="업체 선택"
              >
                {companies.map((company) => (
                  <MenuItem key={company.companyId} value={company.companyId}>
                    {company.companyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="건물명"
              margin="normal"
              value={formData.buildingName}
              onChange={(e) => setFormData({...formData, buildingName: e.target.value})}
            />

            <TextField
              fullWidth
              label="주소"
              margin="normal"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />

            <TextField
              fullWidth
              label="건물등급"
              margin="normal"
              value={formData.buildingGrade}
              onChange={(e) => setFormData({...formData, buildingGrade: e.target.value})}
            />
          </Box>
        )}

        {/* 점검 상태 단계 */}
        {activeStep === 1 && (
          <Box>
            <TextField
              fullWidth
              label="소화설비 상태"
              multiline
              rows={4}
              margin="normal"
              value={formData.fireExtinguisherStatus}
              onChange={(e) => setFormData({...formData, fireExtinguisherStatus: e.target.value})}
            />
            <VoiceRecorder 
              label="소화설비 상태 음성 입력"
              onTranscriptionComplete={(text) => {
                setFormData(prev => ({
                  ...prev,
                  fireExtinguisherStatus: text
                }));
              }}
            />

            <TextField
              fullWidth
              label="경보설비 상태"
              multiline
              rows={4}
              margin="normal"
              value={formData.fireAlarmStatus}
              onChange={(e) => setFormData({...formData, fireAlarmStatus: e.target.value})}
            />
            <VoiceRecorder 
              label="경보설비 상태 음성 입력"
              onTranscriptionComplete={(text) => {
                setFormData(prev => ({
                  ...prev,
                  fireAlarmStatus: text
                }));
              }}
            />

            <TextField
              fullWidth
              label="피난구조설비 상태"
              multiline
              rows={4}
              margin="normal"
              value={formData.fireEvacuationStatus}
              onChange={(e) => setFormData({...formData, fireEvacuationStatus: e.target.value})}
            />
            <VoiceRecorder 
              label="피난구조설비 상태 음성 입력"
              onTranscriptionComplete={(text) => {
                setFormData(prev => ({
                  ...prev,
                  fireEvacuationStatus: text
                }));
              }}
            />

            <TextField
              fullWidth
              label="소화용수설비 상태"
              multiline
              rows={4}
              margin="normal"
              value={formData.fireWaterStatus}
              onChange={(e) => setFormData({...formData, fireWaterStatus: e.target.value})}
            />
            <VoiceRecorder 
              label="소화용수설비 상태 음성 입력"
              onTranscriptionComplete={(text) => {
                setFormData(prev => ({
                  ...prev,
                  fireWaterStatus: text
                }));
              }}
            />

            <TextField
              fullWidth
              label="소화활동설비 상태"
              multiline
              rows={4}
              margin="normal"
              value={formData.fireFightingStatus}
              onChange={(e) => setFormData({...formData, fireFightingStatus: e.target.value})}
            />
            <VoiceRecorder 
              label="소화활동설비 상태 음성 입력"
              onTranscriptionComplete={(text) => {
                setFormData(prev => ({
                  ...prev,
                  fireFightingStatus: text
                }));
              }}
            />

            <TextField
              fullWidth
              label="기타 의견"
              multiline
              rows={4}
              margin="normal"
              value={formData.etcComment}
              onChange={(e) => setFormData({...formData, etcComment: e.target.value})}
            />
            <VoiceRecorder 
              label="기타 의견 음성 입력"
              onTranscriptionComplete={(text) => {
                setFormData(prev => ({
                  ...prev,
                  etcComment: text
                }));
              }}
            />
          </Box>
        )}

        {/* 이미지 첨부 단계로 수정 */}
        {activeStep === 2 && (
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              multiple
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current.click()}
              sx={{ mb: 2 }}
            >
              이미지 첨부
            </Button>

            <Grid container spacing={2}>
              {formData.attachments.map((attachment, index) => (
                <Grid item xs={6} key={index}>
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '100%',
                      '& img': {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }
                    }}
                  >
                    <img src={attachment.preview} alt={`첨부 ${index + 1}`} />
                    <IconButton
                      size="small"
                      onClick={() => handleFileDelete(index)}
                      sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        bgcolor: 'rgba(255,255,255,0.9)'
                      }}
                    >
                          <DeleteIcon />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            이전
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleConfirmOpen : handleNext}
          >
            {activeStep === steps.length - 1 ? '완료' : '다음'}
          </Button>
        </Box>
      </Paper>

      {/* 확인 다이얼로그 */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            입력하신 정보가 맞습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>취소</Button>
          <Button onClick={handleFinalSubmit} variant="contained">
            확인
          </Button>
        </DialogActions>
      </Dialog>

      {/* 서명 다이얼로그 */}
      <SignatureDialog
        open={signatureDialogOpen}
        onClose={() => setSignatureDialogOpen(false)}
        onConfirm={handleSignatureComplete}
      />
    </Container>
  );
};

export default FireSafetyInspectionForm; 