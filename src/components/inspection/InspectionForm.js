import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Button,
  Container,
  Paper,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  ImageList,
  ImageListItem,
  Alert,
  Snackbar,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SignatureDialog from './SignatureDialog';
import { useNavigate } from 'react-router-dom';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import VoiceRecorder from './VoiceRecorder';
import SearchIcon from '@mui/icons-material/Search';

const steps = ['기본 정보', '기본사항', '고압설비', '저압설비', '측정개소', '특이사항'];

// 점검항목 상수 정의
const INSPECTION_ITEMS = [
  { id: 'wiringInlet', label: '인입구배선' },
  { id: 'distributionPanel', label: '분전반' },
  { id: 'moldedCaseBreaker', label: '배선용차단기' },
  { id: 'earthLeakageBreaker', label: '누전차단기' },
  { id: 'switchGear', label: '개폐기' },
  { id: 'wiring', label: '배선' },
  { id: 'motor', label: '전동기' },
  { id: 'heatingEquipment', label: '가열장치' },
  { id: 'welder', label: '용접기' },
  { id: 'capacitor', label: '콘덴서' },
  { id: 'lighting', label: '조명설비' },
  { id: 'grounding', label: '접지설비' },
  { id: 'internalWiring', label: '옥내배선' },
  { id: 'generator', label: '발전기' },
  { id: 'otherEquipment', label: '기타설비' }
];

// 고압설비 점검항목 상수 추가
const HIGH_VOLTAGE_ITEMS = [
  { id: 'aerialLine', label: '가공전선로' },
  { id: 'undergroundWireLine', label: '지중전선로' },
  { id: 'powerSwitch', label: '수배전용 개폐기' },
  { id: 'busbar', label: '배선(모선)' },
  { id: 'lightningArrester', label: '피뢰기' },
  { id: 'transformer', label: '변성기' },
  { id: 'powerFuse', label: '전력 퓨즈' },
  { id: 'powerTransformer', label: '변압기' },
  { id: 'incomingPanel', label: '수배전반' },
  { id: 'relay', label: '계전기류' },
  { id: 'circuitBreaker', label: '차단기류' },
  { id: 'powerCapacitor', label: '전력용 콘덴서' },
  { id: 'protectionEquipment', label: '보호설비' },
  { id: 'loadEquipment', label: '부하 설비' },
  { id: 'groundingSystem', label: '접지 설비' }
];

const textFieldStyle = {
  flex: 1,
  '& .MuiInputBase-input': {
    fontSize: '1.4rem',
    padding: '12px 14px',
  },
  '& .MuiInputAdornment-root': {
    '& .MuiTypography-root': {
      fontSize: '1.3rem',
    }
  },
  '& .MuiInputLabel-root': {
    fontSize: '1.3rem',
  }
};

/* 점검 폼 컴포넌트 */
const InspectionForm = ({ isEdit = false, initialData = null, inspectionId = null }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(() => ({
    companyId: '',
    inspectionDate: new Date(),
    managerName: '',
    
    // 기본사항 필드
    faucetVoltage: '',
    faucetCapacity: '',
    generationVoltage: '',
    generationCapacity: '',
    solarCapacity: '',
    contractCapacity: '',
    inspectionType: '',
    inspectionCount: '',
    
    // 점검내역 필드
    ...Object.fromEntries(INSPECTION_ITEMS.map(item => [item.id, 'O'])),
    
    // 고압설비 점검내역 필드 추가
    ...Object.fromEntries(HIGH_VOLTAGE_ITEMS.map(item => [item.id, 'O'])),
    
    // 측정개소
    measurements: [
        {
            measurementNumber: 1,
            voltageA: '', currentA: '', temperatureA: '',
            voltageB: '', currentB: '', temperatureB: '',
            voltageC: '', currentC: '', temperatureC: '',
            voltageN: '', currentN: '', temperatureN: ''
        }
    ],
    
    // 특이사항
    specialNotes: ''
  }));
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [signature, setSignature] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);
  const [formErrors, setFormErrors] = useState({
    inspectionDate: false,
    companyId: false,
    managerName: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  // 새로 작성할 때만 현재 사용자 정보 가져오기
  useEffect(() => {
    const fetchCurrentUser = async () => {
      // 수정 모드가 아닐 때만 실행
      if (!isEdit) {
        try {
          const token = sessionStorage.getItem('token');
          const response = await fetch('http://localhost:8080/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const userData = await response.json();
            setFormData(prev => ({
              ...prev,
              managerName: userData.fullName || ''
            }));
          }
        } catch (error) {
          console.error('사용자 정보 조회 실패:', error);
        }
      }
    };

    fetchCurrentUser();
  }, [isEdit]); // isEdit이 변경될 때마다 실행

  // 수정 모드일 때 초기 데이터 설정
  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        companyId: initialData.companyId || '',
        inspectionDate: initialData.inspectionDate ? new Date(initialData.inspectionDate) : null,
        managerName: initialData.managerName || '',
        faucetVoltage: initialData.faucetVoltage || '',
        faucetCapacity: initialData.faucetCapacity || '',
        generationVoltage: initialData.generationVoltage || '',
        generationCapacity: initialData.generationCapacity || '',
        solarCapacity: initialData.solarCapacity || '',
        contractCapacity: initialData.contractCapacity || '',
        inspectionType: initialData.inspectionType || '',
        inspectionCount: initialData.inspectionCount || '',
        // 점검내역 필드들 추가
        wiringInlet: initialData.wiringInlet || 'O',
        distributionPanel: initialData.distributionPanel || 'O',
        moldedCaseBreaker: initialData.moldedCaseBreaker || 'O',
        earthLeakageBreaker: initialData.earthLeakageBreaker || 'O',
        switchGear: initialData.switchGear || 'O',
        wiring: initialData.wiring || 'O',
        motor: initialData.motor || 'O',
        heatingEquipment: initialData.heatingEquipment || 'O',
        welder: initialData.welder || 'O',
        capacitor: initialData.capacitor || 'O',
        lighting: initialData.lighting || 'O',
        grounding: initialData.grounding || 'O',
        internalWiring: initialData.internalWiring || 'O',
        generator: initialData.generator || 'O',
        otherEquipment: initialData.otherEquipment || 'O',
        // 고압설비 점검내역 필드들 추가
        aerialLine: initialData.aerialLine || 'O',
        undergroundWireLine: initialData.undergroundWireLine || 'O',
        powerSwitch: initialData.powerSwitch || 'O',
        busbar: initialData.busbar || 'O',
        lightningArrester: initialData.lightningArrester || 'O',
        transformer: initialData.transformer || 'O',
        powerFuse: initialData.powerFuse || 'O',
        powerTransformer: initialData.powerTransformer || 'O',
        incomingPanel: initialData.incomingPanel || 'O',
        relay: initialData.relay || 'O',
        circuitBreaker: initialData.circuitBreaker || 'O',
        powerCapacitor: initialData.powerCapacitor || 'O',
        protectionEquipment: initialData.protectionEquipment || 'O',
        loadEquipment: initialData.loadEquipment || 'O',
        groundingSystem: initialData.groundingSystem || 'O',
        // 측정개소 데이터
        measurements: initialData.measurements.map(m => ({
          measurementNumber: m.measurementNumber,
          voltageA: m.voltageA || '',
          currentA: m.currentA || '',
          temperatureA: m.temperatureA || '',
          voltageB: m.voltageB || '',
          currentB: m.currentB || '',
          temperatureB: m.temperatureB || '',
          voltageC: m.voltageC || '',
          currentC: m.currentC || '',
          temperatureC: m.temperatureC || '',
          voltageN: m.voltageN || '',
          currentN: m.currentN || '',
          temperatureN: m.temperatureN || ''
        })),
        specialNotes: initialData.specialNotes || ''
      });

      // 이미지가 있다면 설정
      if (initialData.images && initialData.images.length > 0) {
        setImages(initialData.images.map(imageName => ({
          preview: `http://localhost:8080/uploads/images/${imageName}`,
          name: imageName,
          isNew: false
        })));
      }
    }
  }, [isEdit, initialData]);

  // 회사 목록 불러오기
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = sessionStorage.getItem('token');
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
        console.error('회사 목록 불러오기 실패:', error);
      }
    };

    fetchCompanies();
  }, []);  // 컴포넌트 마운트 시 한 번만 실행

  const handleNext = () => {
    // 기본 정보 단계에서만 유효성 검사 실행
    if (activeStep === 0) {
      // 유효성 검사
      const errors = {
        inspectionDate: !formData.inspectionDate,
        companyId: !formData.companyId,
        managerName: !formData.managerName?.trim()
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

  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/inspection/safety'); // 안전교육 페이지로 이동
      return;
    }
    setActiveStep((prev) => prev - 1); // 이전 스탭으로 이동
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setActiveStep(0); // 첫 번째 스텝으로 이동
      alert('기본정보를 반드시 입력해주세요.');
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    setConfirmDialogOpen(false);
    setSignatureDialogOpen(true);
  };

  const handleSignatureConfirm = async (signatureData) => {
    try {
      const formDataObj = new FormData();
      
      const inspectionData = {
        ...formData,
        signature: signatureData,
        measurements: formData.measurements.map(m => ({
          measurementNumber: m.measurementNumber,
          voltageA: m.voltageA || '',
          currentA: m.currentA || '',
          temperatureA: m.temperatureA || '',
          voltageB: m.voltageB || '',
          currentB: m.currentB || '',
          temperatureB: m.temperatureB || '',
          voltageC: m.voltageC || '',
          currentC: m.currentC || '',
          temperatureC: m.temperatureC || '',
          voltageN: m.voltageN || '',
          currentN: m.currentN || '',
          temperatureN: m.temperatureN || ''
        }))
      };

      // 이미지 처리
      const newImages = images.filter(img => img.isNew && img.file);
      const existingImages = images
        .filter(img => !img.isNew && img.name)
        .map(img => img.name);

      // inspectionData에 이미지 정보 추가
      inspectionData.images = existingImages;

      formDataObj.append('inspectionData', JSON.stringify(inspectionData));

      // 새 이미지만 FormData에 추가
      if (newImages.length > 0) {
        newImages.forEach(image => {
          formDataObj.append('images', image.file);
        });
      }

      const url = isEdit 
        ? `http://localhost:8080/api/inspections/${inspectionId}`
        : 'http://localhost:8080/api/inspections';


      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: formDataObj
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server Error:', errorText);
        throw new Error(isEdit ? '점검 데이터 수정에 실패했습니다.' : '점검 데이터 저장에 실패했습니다.');
      }

      const result = await response.json();
      navigate(`/inspection/${isEdit ? inspectionId : result}`);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const handleAddMeasurement = () => {
    if (formData.measurements.length < 3) { // 측정개소 최대 3개 제한
      const newMeasurement = {
        measurementNumber: formData.measurements.length + 1, // 측정개소 번호 재정렬
        voltageA: '', currentA: '', temperatureA: '', // 측정개소 전압, 전류, 온도 초기화
        voltageB: '', currentB: '', temperatureB: '',
        voltageC: '', currentC: '', temperatureC: '',
        voltageN: '', currentN: '', temperatureN: ''
      };
      setFormData({
        ...formData,
        measurements: [...formData.measurements, newMeasurement]
      });
    }
  };

  const handleRemoveMeasurement = (index) => {
    const newMeasurements = formData.measurements.filter((_, i) => i !== index);
    // 측정개소 번호 재정렬
    newMeasurements.forEach((m, i) => {
      m.measurementNumber = i + 1;
    });
    setFormData({
      ...formData, 
      measurements: newMeasurements // 측정개소 삭제
    });
  };

  // 회사 선택 핸들러
  const handleCompanySelect = (event) => {
    setFormData({
        ...formData,
        companyId: event.target.value
    });
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // 중복 체크 추가
          const isDuplicate = images.some(img => 
            img.file && img.file.name === file.name
          );
          
          if (!isDuplicate) {
            setImages(prev => [...prev, {
              file: file,
              preview: e.target.result,
              isNew: true
            }]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // 스텝 클릭 핸들러 수정
  const handleStepClick = (index) => {
    // 기본 정보가 모두 입력되었는지 확인
    if (index > 0) {
      const errors = {
        inspectionDate: !formData.inspectionDate,
        companyId: !formData.companyId,
        managerName: !formData.managerName?.trim()
      };

      if (Object.values(errors).some(error => error)) {
        setFormErrors(errors);
        setSnackbar({
          open: true,
          message: '점검일자, 업체, 점검자 정보를 모두 입력해주세요.',
          severity: 'error'
        });
        setActiveStep(0);
        return;
      }
    }
    
    setActiveStep(index);
  };

  // 유효성 검사 함수 추가
  const validateForm = () => {
    const errors = {
      inspectionDate: !formData.inspectionDate,
      companyId: !formData.companyId,
      inspectorName: !formData.managerName
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  return ( // 스탭 바 스타일 적용 (vertical=수직 / horizontal =수평)
    <Container maxWidth="sm" disableGutters>
            {/* 헤더 추가 */}
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
          {isEdit ? '점검 내용 수정' : '점검 시작하기'}
        </Typography>
      </Box>
      <Paper sx={{ p: 2, backgroundColor: '#FFFFFF' }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                onClick={() => handleStepClick(index)}
                sx={{
                  cursor: 'pointer',  // 모든 단계를 클릭 가능하도록
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

        <Box sx={{ mt: 2 }}>
          {/* 기본 정보 */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: '#2A2A2A' }}>
                기본 정보
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="점검일자"
                  value={formData.inspectionDate}
                  onChange={(date) => {
                    setFormData({...formData, inspectionDate: date});
                    setFormErrors({...formErrors, inspectionDate: false});
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                      error: formErrors.inspectionDate,
                      helperText: formErrors.inspectionDate ? "점검일자를 선택해주세요" : "",
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <Autocomplete
                  value={companies.find(company => company.companyId === formData.companyId) || null}
                  onChange={(event, newValue) => {
                    setFormData({
                      ...formData,
                      companyId: newValue ? newValue.companyId : ''
                    });
                    setFormErrors(prev => ({...prev, companyId: false}));
                  }}
                  options={companies}
                  getOptionLabel={(option) => option.companyName}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="업체 선택"
                      error={formErrors.companyId}
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
                label="점검자"
                value={formData.managerName}
                onChange={(e) => {
                  setFormData({...formData, managerName: e.target.value});
                  setFormErrors({...formErrors, inspectorName: false});
                }}
                error={formErrors.inspectorName}
                helperText={formErrors.inspectorName ? "점검자를 입력해주세요" : ""}
                required
                sx={{ mb: 2 }}
              />
            </Box>
          )}

          {/* 기본사항 */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                기본사항
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  sx={textFieldStyle}
                  label="수전전압"
                  type="number"
                  margin="normal"
                  value={formData.faucetVoltage}
                  onChange={(e) => {
                    if (e.target.value.length <= 5) {
                      setFormData({ ...formData, faucetVoltage: e.target.value });
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <>
                        <InputAdornment position="end">V</InputAdornment>
                        <VoiceRecorder 
                          label="수전전압"
                          onTranscriptionComplete={(text) => {
                            const number = text.replace(/[^0-9]/g, '').slice(0, 5); // 5자리 제한
                            setFormData(prev => ({
                              ...prev,
                              faucetVoltage: number
                            }));
                          }}
                        />
                      </>
                    ),
                  }}
                />
                <TextField
                  sx={textFieldStyle}
                  label="수전용량"
                  type="number"
                  margin="normal"
                  value={formData.faucetCapacity}
                  onChange={(e) => {
                    if (e.target.value.length <= 5) {
                      setFormData({ ...formData, faucetCapacity: e.target.value });
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <>
                        <InputAdornment position="end">kW</InputAdornment>
                        <VoiceRecorder 
                          label="수전용량"
                          onTranscriptionComplete={(text) => {
                            const number = text.replace(/[^0-9]/g, '').slice(0, 5); // 5자리 제한
                            setFormData(prev => ({
                              ...prev,
                              faucetCapacity: number
                            }));
                          }}
                        />
                      </>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  sx={textFieldStyle}
                  label="발전전압"
                  type="number"
                  margin="normal"
                  value={formData.generationVoltage}
                  onChange={(e) => {
                    if (e.target.value.length <= 5) {
                      setFormData({ ...formData, generationVoltage: e.target.value });
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <>
                        <InputAdornment position="end">V</InputAdornment>
                        <VoiceRecorder 
                          label="발전전압"
                          onTranscriptionComplete={(text) => {
                            const number = text.replace(/[^0-9]/g, '').slice(0, 5);
                            setFormData(prev => ({
                              ...prev,
                              generationVoltage: number
                            }));
                          }}
                        />
                      </>
                    ),
                  }}
                />
                <TextField
                  sx={textFieldStyle}
                  label="발전용량"
                  type="number"
                  margin="normal"
                  value={formData.generationCapacity}
                  onChange={(e) => {
                    if (e.target.value.length <= 5) {
                      setFormData({ ...formData, generationCapacity: e.target.value });
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <>
                        <InputAdornment position="end">kW</InputAdornment>
                        <VoiceRecorder 
                          label="발전용량"
                          onTranscriptionComplete={(text) => {
                            const number = text.replace(/[^0-9]/g, '').slice(0, 5);
                            setFormData(prev => ({
                              ...prev,
                              generationCapacity: number
                            }));
                          }}
                        />
                      </>
                    ),
                  }}
                />
              </Box>

              <TextField
                sx={textFieldStyle}
                fullWidth
                label="태양광"
                type="number"
                margin="normal"
                value={formData.solarCapacity}
                onChange={(e) => {
                  if (e.target.value.length <= 5) {
                    setFormData({ ...formData, solarCapacity: e.target.value });
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <>
                      <InputAdornment position="end">kW</InputAdornment>
                      <VoiceRecorder 
                        label="태양광"
                        onTranscriptionComplete={(text) => {
                          const number = text.replace(/[^0-9]/g, '').slice(0, 5);
                          setFormData(prev => ({
                            ...prev,
                            solarCapacity: number
                          }));
                        }}
                      />
                    </>
                  ),
                }}
              />

              <TextField
                sx={textFieldStyle}
                fullWidth
                label="계약용량"
                type="number"
                margin="normal"
                value={formData.contractCapacity}
                onChange={(e) => {
                  if (e.target.value.length <= 5) {
                    setFormData({ ...formData, contractCapacity: e.target.value });
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <>
                      <InputAdornment position="end">kW</InputAdornment>
                      <VoiceRecorder 
                        label="계약용량"
                        onTranscriptionComplete={(text) => {
                          const number = text.replace(/[^0-9]/g, '').slice(0, 5);
                          setFormData(prev => ({
                            ...prev,
                            contractCapacity: number
                          }));
                        }}
                      />
                    </>
                  ),
                }}
              />
              
              <TextField
                sx={textFieldStyle}
                fullWidth
                label="점검종별"
                margin="normal"
                value={formData.inspectionType}
                onChange={(e) => setFormData({
                  ...formData,
                  inspectionType: e.target.value
                })}
                InputProps={{
                  endAdornment: (
                    <VoiceRecorder 
                      label="점검종별"
                      onTranscriptionComplete={(text) => {
                        setFormData(prev => ({
                          ...prev,
                          inspectionType: text
                        }));
                      }}
                    />
                  ),
                }}
              />
              <TextField
                sx={textFieldStyle}
                fullWidth
                label="점검횟수"
                type="number"
                margin="normal"
                value={formData.inspectionCount}
                onChange={(e) => {
                  if (e.target.value.length <= 5) {
                    setFormData({ ...formData, inspectionCount: e.target.value });
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <>
                      <InputAdornment position="end">회</InputAdornment>
                      <VoiceRecorder 
                        label="점검횟수"
                        onTranscriptionComplete={(text) => {
                          const number = text.replace(/[^0-9]/g, '').slice(0, 5);
                          setFormData(prev => ({
                            ...prev,
                            inspectionCount: number
                          }));
                        }}
                      />
                    </>
                  ),
                }}
              />
            </Box>
          )}

          {/* 고압설비 */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                고압설비
              </Typography>
              {HIGH_VOLTAGE_ITEMS.map(item => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #eee',
                    minWidth: '100%',
                    '& .MuiFormControlLabel-root': {
                      margin: 0,
                      minWidth: 'auto',
                      flex: 1,
                    },
                    '& .MuiFormControlLabel-label': {
                      fontSize: '1.3rem'
                    },
                    '& .MuiRadio-root': {
                      transform: 'scale(1.3)'
                    }
                  }}
                >
                  <Typography sx={{ 
                    flexBasis: '35%',
                    fontSize: '1.3rem',
                    paddingRight: '8px'
                  }}>
                    {item.label}
                  </Typography>
                  <RadioGroup
                    row
                    sx={{ 
                      flexBasis: '65%',
                      justifyContent: 'flex-end',
                      gap: '4px'
                    }}
                    value={formData[item.id] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      [item.id]: e.target.value
                    })}
                  >
                    <FormControlLabel value="O" control={<Radio />} label="적합" />
                    <FormControlLabel value="X" control={<Radio />} label="부적합" />
                    <FormControlLabel value="/" control={<Radio />} label="해당없음" />
                  </RadioGroup>
                </Box>
              ))}
            </Box>
          )}

          {/* 점검내역 (저압설비) */}
          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                저압설비
              </Typography>
              {INSPECTION_ITEMS.map(item => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #eee',
                    minWidth: '100%',
                    '& .MuiFormControlLabel-root': {
                      margin: 0,
                      minWidth: 'auto',
                      flex: 1,
                    },
                    '& .MuiFormControlLabel-label': {
                      fontSize: '1.3rem'  // 라벨 폰트 크기 증가
                    },
                    '& .MuiRadio-root': {
                      transform: 'scale(1.3)'  // 라디오 버튼 크기 증가
                    }
                  }}
                >
                  <Typography sx={{ 
                    flexBasis: '35%',
                    fontSize: '1.3rem',  // 항목명 폰트 크기 증가
                    paddingRight: '8px'
                  }}>
                    {item.label}
                  </Typography>
                  <RadioGroup
                    row
                    sx={{ 
                      flexBasis: '65%',
                      justifyContent: 'flex-end',
                      gap: '4px'
                    }}
                    value={formData[item.id] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      [item.id]: e.target.value
                    })}
                  >
                    <FormControlLabel value="O" control={<Radio />} label="적합" />
                    <FormControlLabel value="X" control={<Radio />} label="부적합" />
                    <FormControlLabel value="/" control={<Radio />} label="해당없음" />
                  </RadioGroup>
                </Box>
              ))}
            </Box>
          )}

          {/* 측정개소 */}
          {activeStep === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                측정개소
              </Typography>
              {formData.measurements.map((measurement, index) => (
                <Box key={index} sx={{ mb: 3, position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1">
                      측정개소 {measurement.measurementNumber}
                    </Typography>
                    {index > 0 && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveMeasurement(index)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    )}
                  </Box>
                  {['A', 'B', 'C', 'N'].map((phase) => (
                    <Box key={phase} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Box 
                        sx={{ 
                          minWidth: '30px',  // 고정된 최소 너비
                          display: 'flex',
                          alignItems: 'center'  // 세로 중앙 정렬
                        }}
                      >
                        <Typography 
                          sx={{ 
                            pt: 2,
                            width: '100%',
                            textAlign: 'right',  // 텍스트 오른쪽 정렬
                            pr: 1,  // 오른쪽 패딩
                            '&::after': {
                              content: '"-"',
                              visibility: phase === 'N' ? 'hidden' : 'visible'  // N일 때는 보이지 않게
                            }
                          }}
                        >
                          {phase}
                        </Typography>
                      </Box>

                      {/* 전압 입력 */}
                      <TextField
                        sx={textFieldStyle}
                        label="전압"
                        type="number"
                        size="small"
                        value={measurement[`voltage${phase}`]}
                        onChange={(e) => {
                          if (e.target.value.length <= 5) {
                            const newMeasurements = [...formData.measurements];
                            newMeasurements[index] = {
                              ...newMeasurements[index],
                              [`voltage${phase}`]: e.target.value
                            };
                            setFormData({...formData, measurements: newMeasurements});
                          }
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">V</InputAdornment>,
                        }}
                      />

                      {/* 전류 입력 */}
                      <TextField
                        sx={textFieldStyle}
                        label="전류"
                        type="number"
                        size="small"
                        value={measurement[`current${phase}`]}
                        onChange={(e) => {
                          if (e.target.value.length <= 5) {
                            const newMeasurements = [...formData.measurements];
                            newMeasurements[index] = {
                              ...newMeasurements[index],
                              [`current${phase}`]: e.target.value
                            };
                            setFormData({...formData, measurements: newMeasurements});
                          }
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">A</InputAdornment>,
                        }}
                      />

                      {/* 온도 입력 */}
                      <TextField
                        sx={textFieldStyle}
                        label="온도"
                        type="number"
                        size="small"
                        value={measurement[`temperature${phase}`]}
                        onChange={(e) => {
                          if (e.target.value.length <= 5) {
                            const newMeasurements = [...formData.measurements];
                            newMeasurements[index] = {
                              ...newMeasurements[index],
                              [`temperature${phase}`]: e.target.value
                            };
                            setFormData({...formData, measurements: newMeasurements});
                          }
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">℃</InputAdornment>,
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              ))}
              {formData.measurements.length < 3 && (
                <Button
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={handleAddMeasurement}
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  측정개소 추가
                </Button>
              )}
            </Box>
          )}

          {/* 특이사항 */}
          {activeStep === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                특이사항
              </Typography>
              <TextField
                sx={textFieldStyle}
                fullWidth
                multiline
                rows={4}
                label="특이사항"
                value={formData.specialNotes}
                onChange={(e) => {
                  if (e.target.value.length <= 3000) {
                    setFormData({...formData, specialNotes: e.target.value});
                  }
                }}
                helperText={`${formData.specialNotes.length} / 3000`} // 현재 입력된 글자 수 표시
                error={formData.specialNotes.length > 3000} // 초과 시 경고 스타일 적용
              />
              <VoiceRecorder 
                onTranscriptionComplete={(text) => {
                  const truncatedText = text.slice(0, 3000); // 3000자까지만 저장
                  setFormData(prev => ({
                    ...prev,
                    specialNotes: truncatedText
                  }));
                }}
              />

              {/* 이미지 업로드 영역을 특이사항 스텝 내부로 이동 */}
              <Box sx={{ mt: 2 }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddPhotoAlternateIcon />}
                  onClick={() => fileInputRef.current.click()}
                  sx={{ mb: 2 }}
                >
                  이미지 첨부
                </Button>
                
                {images.length > 0 && (
                  <ImageList sx={{ width: '100%', height: 'auto' }} cols={2} rowHeight={164}>
                    {images.map((image, index) => (
                      <ImageListItem key={index} sx={{ position: 'relative' }}>
                        <img
                          src={image.preview}
                          alt={`첨부 이미지 ${index + 1}`}
                          loading="lazy"
                          style={{ height: '100%', objectFit: 'cover' }}
                        />
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            bgcolor: 'rgba(255,255,255,0.9)'
                          }}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            sx={{ 
              color: '#2A2A2A',
              '&:hover': {
                backgroundColor: 'rgba(42, 42, 42, 0.04)'
              }
            }}
            onClick={handleBack}
          >
            이전
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            sx={{ backgroundColor: '#1C243A', color: 'white' }}
          >
            {activeStep === steps.length - 1 ? '저장' : '다음'}
          </Button>
        </Box>

        {/* 확인 다이얼로그 */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
        >
          <DialogTitle>확인</DialogTitle>
          <DialogContent>
            <DialogContentText>
              입력한 정보가 맞습니까?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>취소</Button>
            <Button onClick={handleConfirmSubmit} variant="contained">
              확인
            </Button>
          </DialogActions>
        </Dialog>

        {/* 서명 다이얼로그 */}
        <SignatureDialog
          open={signatureDialogOpen}
          onClose={() => setSignatureDialogOpen(false)}
          onConfirm={handleSignatureConfirm}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default InspectionForm; 