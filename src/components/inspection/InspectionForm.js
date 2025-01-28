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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ImageList,
  ImageListItem
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

const steps = ['기본 정보', '기본사항', '점검내역', '측정개소', '특이사항'];

/* 점검 폼 컴포넌트 */
const InspectionForm = () => {
  const navigate = useNavigate(); // 네비게이션 기능 사용
  const [activeStep, setActiveStep] = useState(0); // 현재 스탭 상태 관리
  const [formData, setFormData] = useState({
    companyId: '',  // facilityName 대신 companyId로 변경
    inspectionDate: null,
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
    wiringInlet: '',
    distributionPanel: '',
    moldedCaseBreaker: '',
    earthLeakageBreaker: '',
    switchGear: '',
    wiring: '',
    motor: '',
    heatingEquipment: '',
    welder: '',
    capacitor: '',
    lighting: '',
    grounding: '',
    internalWiring: '',
    generator: '',
    otherEquipment: '',
    
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
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // 확인 다이얼로그 상태 관리
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false); // 서명 다이얼로그 상태 관리
  const [signature, setSignature] = useState(null); // 서명 데이터 상태 관리
  const [companies, setCompanies] = useState([]);  // 회사 목록을 위한 state 추가
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // 회사 목록 불러오기
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/companies');
        if (response.ok) {
          const data = await response.json();
          // 회사명 기준으로 가나다순 정렬
          const sortedCompanies = data.sort((a, b) => 
            a.companyName.localeCompare(b.companyName, 'ko')
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
    setActiveStep((prev) => prev + 1); // 다음 스탭으로 이동
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/inspection/safety'); // 안전교육 페이지로 이동
      return;
    }
    setActiveStep((prev) => prev - 1); // 이전 스탭으로 이동
  };

  const handleSubmit = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    setConfirmDialogOpen(false);
    setSignatureDialogOpen(true);
  };

  const handleSignatureConfirm = async (signatureData) => {
    try {
      const formDataObj = new FormData();
      
      // 점검 데이터 객체 생성
      const inspectionData = {
        companyId: formData.companyId,
        inspectionDate: formData.inspectionDate ? formData.inspectionDate.toISOString().split('T')[0] : null,
        managerName: formData.managerName,
        
        // 기본사항
        faucetVoltage: formData.faucetVoltage || null,
        faucetCapacity: formData.faucetCapacity || null,
        generationVoltage: formData.generationVoltage || null,
        generationCapacity: formData.generationCapacity || null,
        solarCapacity: formData.solarCapacity || null,
        contractCapacity: formData.contractCapacity || null,
        inspectionType: formData.inspectionType || '',
        inspectionCount: formData.inspectionCount || null,
        
        // 점검내역
        wiringInlet: formData.wiringInlet || null,
        distributionPanel: formData.distributionPanel || null,
        moldedCaseBreaker: formData.moldedCaseBreaker || null,
        earthLeakageBreaker: formData.earthLeakageBreaker || null,
        switchGear: formData.switchGear || null,
        wiring: formData.wiring || null,
        motor: formData.motor || null,
        heatingEquipment: formData.heatingEquipment || null,
        welder: formData.welder || null,
        capacitor: formData.capacitor || null,
        lighting: formData.lighting || null,
        grounding: formData.grounding || null,
        internalWiring: formData.internalWiring || null,
        generator: formData.generator || null,
        otherEquipment: formData.otherEquipment || null,
        
        // 측정개소
        measurements: formData.measurements.map(m => ({
          measurementNumber: m.measurementNumber,
          voltageA: parseFloat(m.voltageA) || 0,
          currentA: parseFloat(m.currentA) || 0,
          temperatureA: parseFloat(m.temperatureA) || 0,
          voltageB: parseFloat(m.voltageB) || 0,
          currentB: parseFloat(m.currentB) || 0,
          temperatureB: parseFloat(m.temperatureB) || 0,
          voltageC: parseFloat(m.voltageC) || 0,
          currentC: parseFloat(m.currentC) || 0,
          temperatureC: parseFloat(m.temperatureC) || 0,
          voltageN: parseFloat(m.voltageN) || 0,
          currentN: parseFloat(m.currentN) || 0,
          temperatureN: parseFloat(m.temperatureN) || 0
        })),
        
        // 특이사항
        specialNotes: formData.specialNotes || '',
        
        // 서명
        signature: signatureData
      };

      // FormData에 inspectionData 추가
      formDataObj.append('inspectionData', JSON.stringify(inspectionData));
      
      // 이미지 파일들 추가
      images.forEach(image => {
        formDataObj.append('images', image.file);
      });

      const response = await fetch('http://localhost:8080/api/inspections', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // 토큰 추가
        },
        body: formDataObj
      });

      if (!response.ok) {
        throw new Error('점검 데이터 저장에 실패했습니다.');
      }

      const result = await response.json();
      navigate(`/inspection/${result}`);
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

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, {
            file: file,
            preview: e.target.result
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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
          점검표 작성
        </Typography>
      </Box>
      <Paper sx={{ p: 2, backgroundColor: '#FFFFFF' }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
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
                  onChange={(date) => setFormData({...formData, inspectionDate: date})}
                  renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                />
              </LocalizationProvider>
              <FormControl fullWidth sx={{ mb: 2 , mt: 4 }}>
                <InputLabel>업체 선택</InputLabel>
                <Select
                    value={formData.companyId}
                    onChange={handleCompanySelect}
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
                label="점검자"
                margin="normal"
                value={formData.managerName}
                onChange={(e) => setFormData({...formData, managerName: e.target.value})}
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
                  sx={{ flex: 1 }}
                  label="수전전압"
                  type="number"
                  margin="normal"
                  value={formData.faucetVoltage}
                  onChange={(e) => setFormData({
                    ...formData,
                    faucetVoltage: e.target.value
                  })}
                  InputProps={{
                    endAdornment: (
                      <>
                        <InputAdornment position="end">V</InputAdornment>
                        <VoiceRecorder 
                          label="수전전압"
                          onTranscriptionComplete={(text) => {
                            // 숫자만 추출
                            const number = text.replace(/[^0-9]/g, '');
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
                  sx={{ flex: 1 }}
                  label="수전용량"
                  type="number"
                  margin="normal"
                  value={formData.faucetCapacity}
                  onChange={(e) => setFormData({
                    ...formData,
                    faucetCapacity: e.target.value
                  })}
                  InputProps={{
                    endAdornment: (
                      <>
                        <InputAdornment position="end">kW</InputAdornment>
                        <VoiceRecorder 
                          label="수전용량"
                          onTranscriptionComplete={(text) => {
                            const number = text.replace(/[^0-9]/g, '');
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
                  sx={{ flex: 1 }}
                  label="발전전압"
                  type="number"
                  margin="normal"
                  value={formData.generationVoltage}
                  onChange={(e) => setFormData({
                    ...formData,
                    generationVoltage: e.target.value
                  })}
                  InputProps={{
                    endAdornment: (
                      <>
                        <InputAdornment position="end">V</InputAdornment>
                        <VoiceRecorder 
                          label="발전전압"
                          onTranscriptionComplete={(text) => {
                            const number = text.replace(/[^0-9]/g, '');
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
                  sx={{ flex: 1 }}
                  label="발전용량"
                  type="number"
                  margin="normal"
                  value={formData.generationCapacity}
                  onChange={(e) => setFormData({
                    ...formData,
                    generationCapacity: e.target.value
                  })}
                  InputProps={{
                    endAdornment: (
                      <>
                        <InputAdornment position="end">kW</InputAdornment>
                        <VoiceRecorder 
                          label="발전용량"
                          onTranscriptionComplete={(text) => {
                            const number = text.replace(/[^0-9]/g, '');
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
                fullWidth
                label="태양광"
                type="number"
                margin="normal"
                value={formData.solarCapacity}
                onChange={(e) => setFormData({
                  ...formData,
                  solarCapacity: e.target.value
                })}
                InputProps={{
                  endAdornment: (
                    <>
                      <InputAdornment position="end">kW</InputAdornment>
                      <VoiceRecorder 
                        label="태양광"
                        onTranscriptionComplete={(text) => {
                          const number = text.replace(/[^0-9]/g, '');
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
                fullWidth
                label="계약용량"
                type="number"
                margin="normal"
                value={formData.contractCapacity}
                onChange={(e) => setFormData({
                  ...formData,
                  contractCapacity: e.target.value
                })}
                InputProps={{
                  endAdornment: (
                    <>
                      <InputAdornment position="end">kW</InputAdornment>
                      <VoiceRecorder 
                        label="계약용량"
                        onTranscriptionComplete={(text) => {
                          const number = text.replace(/[^0-9]/g, '');
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
                fullWidth
                label="점검횟수"
                type="number"
                margin="normal"
                value={formData.inspectionCount}
                onChange={(e) => setFormData({
                  ...formData,
                  inspectionCount: e.target.value
                })}
                InputProps={{
                  endAdornment: (
                    <>
                      <InputAdornment position="end">회</InputAdornment>
                      <VoiceRecorder 
                        label="점검횟수"
                        onTranscriptionComplete={(text) => {
                          const number = text.replace(/[^0-9]/g, '');
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

          {/* 점검내역 */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                점검내역
              </Typography>
              {[
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
              ].map(item => (
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
                      flex: 1
                    },
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.8rem'
                    },
                    '& .MuiRadio-root': {
                      padding: '4px'
                    }
                  }}
                >
                  <Typography sx={{ 
                    flexBasis: '35%',
                    fontSize: '0.9rem',
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
                    <FormControlLabel value="O" control={<Radio size="small" />} label="적합" />
                    <FormControlLabel value="X" control={<Radio size="small" />} label="부적합" />
                    <FormControlLabel value="/" control={<Radio size="small" />} label="해당없음" />
                  </RadioGroup>
                </Box>
              ))}
            </Box>
          )}

          {/* 측정개소 */}
          {activeStep === 3 && (
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
                      <TextField
                        label="전압"
                        type="number"
                        size="small"
                        value={measurement[`voltage${phase}`]}
                        onChange={(e) => {
                          const newMeasurements = [...formData.measurements];
                          newMeasurements[index] = {
                            ...newMeasurements[index],
                            [`voltage${phase}`]: e.target.value
                          };
                          setFormData({...formData, measurements: newMeasurements});
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">V</InputAdornment>,
                        }}
                      />
                      <TextField
                        label="전류"
                        type="number"
                        size="small"
                        value={measurement[`current${phase}`]}
                        onChange={(e) => {
                          const newMeasurements = [...formData.measurements];
                          newMeasurements[index] = {
                            ...newMeasurements[index],
                            [`current${phase}`]: e.target.value
                          };
                          setFormData({...formData, measurements: newMeasurements});
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">A</InputAdornment>,
                        }}
                      />
                      <TextField
                        label="온도"
                        type="number"
                        size="small"
                        value={measurement[`temperature${phase}`]}
                        onChange={(e) => {
                          const newMeasurements = [...formData.measurements];
                          newMeasurements[index] = {
                            ...newMeasurements[index],
                            [`temperature${phase}`]: e.target.value
                          };
                          setFormData({...formData, measurements: newMeasurements});
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
          {activeStep === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                특이사항
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="특이사항"
                value={formData.specialNotes}
                onChange={(e) => setFormData({...formData, specialNotes: e.target.value})}
              />
              <VoiceRecorder 
                onTranscriptionComplete={(text) => {
                  setFormData(prev => ({
                    ...prev,
                    specialNotes: text
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
      </Paper>
    </Container>
  );
};

export default InspectionForm; 