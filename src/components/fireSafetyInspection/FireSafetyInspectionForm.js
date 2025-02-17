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
  Grid,
  Paper,
  Container,
  Dialog,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  InputAdornment,
  Autocomplete,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useNavigate, useParams } from 'react-router-dom';
import SignatureDialog from '../inspection/SignatureDialog';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VoiceRecorder from '../inspection/VoiceRecorder';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

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
  const [formErrors, setFormErrors] = useState({
    buildingName: false,
    buildingAddress: false,
    inspectionDate: false,
    inspectorName: false,
    companyName: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const [formData, setFormData] = useState({
    writerId: '',
    companyId: '',
    buildingName: '',
    inspectionDate: new Date(),
    address: '',
    buildingGrade: '',
    fireExtinguisherStatus: '',
    fireAlarmStatus: '',
    fireEvacuationStatus: '',
    fireWaterStatus: '',
    fireFightingStatus: '',
    etcComment: '',
    inspectorSignature: '',
    managerSignature: '',
    attachments: []
  });

  // 검색어 상태 추가
  const [searchKeyword, setSearchKeyword] = useState('');

  // 필터링된 업체 목록 계산
  const filteredCompanies = companies.filter(company => 
    company.companyName.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  useEffect(() => {
    // id가 있으면 수정 모드로 데이터 불러오기
    if (id) {
      setIsEdit(true);
      fetchInspectionData();
    }
  }, [id]);

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
        const token = sessionStorage.getItem('token');
        
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
          // 회사명 기준으로 오름차순 정렬
          const sortedCompanies = companiesData.sort((a, b) => 
            a.companyName.localeCompare(b.companyName, 'ko')  // 한글 정렬
          );
          setCompanies(sortedCompanies);
        }
      } catch (error) {
        console.error('초기 데이터 로딩 실패:', error);
      }
    };

    fetchInitialData();
  }, []);

  // 첫 번째 스텝에서 토큰 체크를 위한 useEffect 추가
  useEffect(() => {
    if (activeStep === 0) {
      const checkToken = setInterval(() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/');
          clearInterval(checkToken);
        }
      }, 1000); // 1초마다 체크

      return () => clearInterval(checkToken);
    }
  }, [activeStep, navigate]);

  // 단계별 제목
  const steps = ['기본 정보', '점검 상태', '이미지 첨부'];

  // 다음 단계로 이동
  const handleNext = () => {
    // 기본 정보 단계에서만 유효성 검사 실행
    if (activeStep === 0) {
      // 유효성 검사
      const errors = {
        buildingName: !formData.buildingName?.trim(),
        buildingAddress: !formData.address?.trim(),
        inspectionDate: !formData.inspectionDate,
        inspectorName: !formData.writerId,
        companyName: !formData.companyId
      };

      // 에러가 하나라도 있는지 확인
      if (Object.values(errors).some(error => error)) {
        setFormErrors(errors);
        setSnackbar({
          open: true,
          message: '필수 입력 항목을 모두 작성해주세요.',
          severity: 'error'
        });
        return;
      }
    }

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
  const handleFinalSubmit = () => {
    // 기본 정보 유효성 검사
    const errors = {
      buildingName: !formData.buildingName?.trim(),
      buildingAddress: !formData.address?.trim(),
      inspectionDate: !formData.inspectionDate,
      inspectorName: !formData.writerId,
      companyName: !formData.companyId
    };

    // 에러가 하나라도 있는지 확인
    if (Object.values(errors).some(error => error)) {
      setFormErrors(errors);
      setSnackbar({
        open: true,
        message: '기본 정보를 모두 작성해주세요.',
        severity: 'error'
      });
      // 기본 정보 단계로 이동
      setActiveStep(0);
      setConfirmDialogOpen(false);
      return;
    }

    // 기존 서명 다이얼로그 열기
    setConfirmDialogOpen(false);
    setSignatureDialogOpen(true);
  };

  // 서명 완료 후 저장
  const handleSignatureComplete = async (signatureData) => {
    setSignatureDialogOpen(false);
    
    try {
      const token = sessionStorage.getItem('token');
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

  // 스텝 이동 함수 수정
  const handleStepClick = (index) => {
    // 기본 정보가 모두 입력되었는지 확인
    if (index > 0) {
      const errors = {
        buildingName: !formData.buildingName?.trim(),
        buildingAddress: !formData.address?.trim(),
        inspectionDate: !formData.inspectionDate,
        inspectorName: !formData.writerId,
        companyName: !formData.companyId
      };

      if (Object.values(errors).some(error => error)) {
        setFormErrors(errors);
        setSnackbar({
          open: true,
          message: '기본 정보를 모두 작성해주세요.',
          severity: 'error'
        });
        setActiveStep(0);
        return;
      }
    }
    
    setActiveStep(index);
  };

  const handleCompanyChange = (event) => {
    const selectedCompany = companies.find(company => company.companyId === event.target.value);
    if (selectedCompany) {
      // 주소와 상세주소를 하나로 합쳐서 저장
      const fullAddress = selectedCompany.detailAddress 
        ? `${selectedCompany.address} ${selectedCompany.detailAddress}`
        : selectedCompany.address;

      setFormData(prev => ({
        ...prev,
        companyId: selectedCompany.companyId,
        buildingName: selectedCompany.companyName,
        address: fullAddress  // 전체 주소를 하나의 필드에 저장
      }));
      setFormErrors(prev => ({
        ...prev, 
        buildingName: false,
        address: false
      }));
    }
  };

  const handleAddressSearch = () => {
    // 주소 검색 로직을 구현해야 합니다.
    console.log("주소 검색 로직을 구현해야 합니다.");
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
                onClick={() => handleStepClick(index)}
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
                onChange={(date) => {
                  setFormData({...formData, inspectionDate: date});
                  setFormErrors(prev => ({...prev, inspectionDate: false}));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={formErrors.inspectionDate}
                    helperText={formErrors.inspectionDate ? "점검일자를 선택해주세요" : ""}
                    required
                  />
                )}
              />
            </LocalizationProvider>

            <FormControl fullWidth margin="normal">
              <Autocomplete
                value={companies.find(company => company.companyId === formData.companyId) || null}
                onChange={(event, newValue) => {
                  handleCompanyChange({
                    target: { 
                      value: newValue ? newValue.companyId : '' 
                    }
                  });
                }}
                options={companies}
                getOptionLabel={(option) => option.companyName}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="업체 선택"
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    padding: '3px'
                  }
                }}
              />
            </FormControl>

            <TextField
              fullWidth
              label="건물명"
              margin="normal"
              value={formData.buildingName}
              onChange={(e) => {
                if (e.target.value.length <= 25) {
                  setFormData({...formData, buildingName: e.target.value});
                  setFormErrors(prev => ({...prev, buildingName: false}));
                }
              }}
              error={formErrors.buildingName}
              helperText={formErrors.buildingName ? "건물명을 입력해주세요" : ""}
              required
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="주소"
                margin="normal"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                error={formErrors.buildingAddress}
                helperText={formErrors.buildingAddress ? "주소를 입력해주세요" : ""}
                required
              />
            </Box>

            <TextField
              fullWidth
              label="건물등급"
              margin="normal"
              value={formData.buildingGrade}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 허용
                if (value.length <= 2) { // 2자리 숫자까지만 허용
                  setFormData({
                    ...formData, 
                    buildingGrade: value // 숫자만 저장
                  });
                }
              }}
              placeholder="숫자만 입력"
              InputProps={{
                endAdornment: <InputAdornment position="end">등급</InputAdornment>,
                inputProps: { 
                  maxLength: 2,
                  style: { textAlign: 'right', paddingRight: '8px' }  // 숫자 우측 정렬
                }
              }}
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
              onChange={(e) => {
                if (e.target.value.length <= 3000) {
                  setFormData({...formData, fireExtinguisherStatus: e.target.value});
                }
              }}
              helperText={`${formData.fireExtinguisherStatus.length} / 3000`}
              error={formData.fireExtinguisherStatus.length > 3000}
            />
            <VoiceRecorder 
              label="소화설비 상태 음성 입력"
              onTranscriptionComplete={(text) => {
                const truncatedText = text.slice(0, 3000); // 3000자까지만 저장
                setFormData(prev => ({
                  ...prev,
                  fireExtinguisherStatus: truncatedText
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
              onChange={(e) => {
                if (e.target.value.length <= 3000) {
                  setFormData({...formData, fireAlarmStatus: e.target.value});
                }
              }}
              helperText={`${formData.fireAlarmStatus.length} / 3000`}
              error={formData.fireAlarmStatus.length > 3000}
            />
            <VoiceRecorder 
              label="경보설비 상태 음성 입력"
              onTranscriptionComplete={(text) => {
                const truncatedText = text.slice(0, 3000);
                setFormData(prev => ({
                  ...prev,
                  fireAlarmStatus: truncatedText
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
              onChange={(e) => {
                if (e.target.value.length <= 3000) {
                  setFormData({...formData, fireEvacuationStatus: e.target.value});
                }
              }}
              helperText={`${formData.fireEvacuationStatus.length} / 3000`}
              error={formData.fireEvacuationStatus.length > 3000}
            />
            <VoiceRecorder 
              label="피난구조설비 상태 음성 입력"
              onTranscriptionComplete={(text) => {
                const truncatedText = text.slice(0, 3000);
                setFormData(prev => ({
                  ...prev,
                  fireEvacuationStatus: truncatedText
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
              onChange={(e) => {
                if (e.target.value.length <= 3000) {
                  setFormData({...formData, fireWaterStatus: e.target.value});
                }
              }}
              helperText={`${formData.fireWaterStatus.length} / 3000`}
              error={formData.fireWaterStatus.length > 3000}
            />
            <VoiceRecorder 
              label="소화용수설비 상태 음성 입력"
              onTranscriptionComplete={(text) => {
                const truncatedText = text.slice(0, 3000);
                setFormData(prev => ({
                  ...prev,
                  fireWaterStatus: truncatedText
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
              onChange={(e) => {
                if (e.target.value.length <= 3000) {
                  setFormData({...formData, fireFightingStatus: e.target.value});
                }
              }}
              helperText={`${formData.fireFightingStatus.length} / 3000`}
              error={formData.fireFightingStatus.length > 3000}
            />
            <VoiceRecorder 
              label="소화활동설비 상태 음성 입력"
              onTranscriptionComplete={(text) => {
                const truncatedText = text.slice(0, 3000);
                setFormData(prev => ({
                  ...prev,
                  fireFightingStatus: truncatedText
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
              onChange={(e) => {
                if (e.target.value.length <= 3000) {
                  setFormData({...formData, etcComment: e.target.value});
                }
              }}
              helperText={`${formData.etcComment.length} / 3000`}
              error={formData.etcComment.length > 3000}
            />
            <VoiceRecorder 
              label="기타 의견 음성 입력"
              onTranscriptionComplete={(text) => {
                const truncatedText = text.slice(0, 3000);
                setFormData(prev => ({
                  ...prev,
                  etcComment: truncatedText
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Container>
  );
};

export default FireSafetyInspectionForm; 