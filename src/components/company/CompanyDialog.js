import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Typography,
  Chip,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';

const CompanyDialog = ({ open, onClose, onSubmit }) => {
  const initialState = {
    companyName: '',
    phoneNumber: '',
    faxNumber: '',
    address: '',
    detailAddress: '',
    notes: '',
    active: true,
    buildingPermitDate: null,
    occupancyDate: null,
    totalFloorArea: '',
    buildingArea: '',
    numberOfUnits: '',
    floorType: '',
    floorCount: '',
    buildingHeight: '',
    numberOfBuildings: '',
    buildingStructure: '',
    roofStructure: '',
    ramp: '',
    stairsType: '',
    stairsCount: '',
    elevatorType: '',
    elevatorCount: '',
    parkingLot: '',
    indoorParkingDetail: '',
    businessNumber: '',
    contractDate: null,
    startDate: null,
    expiryDate: null,
    monthlyFee: '',
    status: 'ACTIVE',
    terminationDate: null,
  };

  const structureOptions = ["콘크리트 구조", "철골구조", "조적조", "목구조", "기타"];
  const roofOptions = ["슬래브", "기와", "슬레이트", "기타"];
  const elevatorTypes = ["승용", "비상용", "피난용"];
  const [companyData, setCompanyData] = useState(initialState);
  const [showBuildingInfo, setShowBuildingInfo] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [activeStep, setActiveStep] = useState(0);
  const [images, setImages] = useState({
    exteriorImage: null,
    entranceImage: null,
    mainPanelImage: null,
    etcImage1: null,
    etcImage2: null,
    etcImage3: null,
    etcImage4: null
  });

  const steps = ['건물 정보', '계약 정보', '이미지 등록'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 숫자 입력 필드들은 별도의 핸들러 사용
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = name === 'businessNumber' 
      ? value.replace(/[^0-9-]/g, '')
      : value.replace(/[^0-9]/g, '');
      
    setCompanyData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const handleDateChange = (name, value) => {
    setCompanyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    setCompanyData(initialState);
    setShowBuildingInfo(false);
    onClose();
  };

  const handleImageChange = (event, field) => {
    if (event.target.files && event.target.files[0]) {
      setImages(prev => ({
        ...prev,
        [field]: event.target.files[0]
      }));
    }
  };

  const handleRemoveImage = (field) => {
    setImages(prev => ({
      ...prev,
      [field]: null
    }));
  };

  const handleSubmit = async () => {
    try {
      const formattedData = {
        ...companyData,
        buildingPermitDate: companyData.buildingPermitDate ? companyData.buildingPermitDate.toISOString().split('T')[0] : null,
        occupancyDate: companyData.occupancyDate ? companyData.occupancyDate.toISOString().split('T')[0] : null,
        totalFloorArea: companyData.totalFloorArea ? parseFloat(companyData.totalFloorArea) : null,
        buildingArea: companyData.buildingArea ? parseFloat(companyData.buildingArea) : null,
        numberOfUnits: companyData.numberOfUnits ? parseInt(companyData.numberOfUnits) : null,
        buildingHeight: companyData.buildingHeight ? parseFloat(companyData.buildingHeight) : null,
        numberOfBuildings: companyData.numberOfBuildings ? parseInt(companyData.numberOfBuildings) : null,
        stairs: companyData.stairsType && companyData.stairsCount 
          ? `${companyData.stairsType} ${companyData.stairsCount}개소` 
          : null,
        elevator: companyData.elevatorType && companyData.elevatorCount    
          ? `${companyData.elevatorType} ${companyData.elevatorCount}개소` 
          : null,
        address: companyData.address && companyData.detailAddress 
          ? `${companyData.address} ${companyData.detailAddress}`
          : companyData.address,
        floorCount: companyData.floorType && companyData.floorCount 
          ? `${companyData.floorType} ${companyData.floorCount}층`
          : null,
        parkingLot: companyData.parkingLot === "옥내" 
          ? `옥내/${companyData.indoorParkingDetail}`
          : companyData.parkingLot,
        contractDate: companyData.contractDate ? companyData.contractDate.toISOString().split('T')[0] : null,
        startDate: companyData.startDate ? companyData.startDate.toISOString().split('T')[0] : null,
        expiryDate: companyData.expiryDate ? companyData.expiryDate.toISOString().split('T')[0] : null,
        terminationDate: companyData.terminationDate ? companyData.terminationDate.toISOString().split('T')[0] : null,
        monthlyFee: companyData.monthlyFee ? parseFloat(companyData.monthlyFee) : null,
        status: companyData.status,
      };

      const formData = new FormData();
      formData.append('company', JSON.stringify(formattedData));

      Object.keys(images).forEach(key => {
        if (images[key]) {
          formData.append(key, images[key]);
        }
      });

      const response = await fetch('http://localhost:8080/api/companies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('업체 등록에 실패했습니다.');
      }

      const savedCompany = await response.json();
      
      setSnackbar({
        open: true,
        message: '업체가 성공적으로 등록되었습니다.',
        severity: 'success'
      });

      handleClose();
      onSubmit(savedCompany);
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({
        open: true,
        message: '업체 등록에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        // 도로명 주소 또는 지번 주소
        const address = data.roadAddress || data.jibunAddress;
        
        setCompanyData(prev => ({
          ...prev,
          address: address,
        }));
      }
    }).open();
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const ContractInfoStep = () => (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="사업자 번호"
            name="businessNumber"
            defaultValue={companyData.businessNumber}
            onBlur={(e) => {
              const value = e.target.value;
              setCompanyData(prev => ({
                ...prev,
                businessNumber: value
              }));
            }}
            placeholder="000-00-00000"
            size="small"
            inputProps={{ maxLength: 12 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DatePicker
            label="계약일자"
            value={companyData.contractDate}
            onChange={(date) => handleDateChange('contractDate', date)}
            renderInput={(params) => <TextField {...params} fullWidth size="small" />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DatePicker
            label="시작일자"
            value={companyData.startDate}
            onChange={(date) => handleDateChange('startDate', date)}
            renderInput={(params) => <TextField {...params} fullWidth size="small" />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DatePicker
            label="만기일자"
            value={companyData.expiryDate}
            onChange={(date) => handleDateChange('expiryDate', date)}
            renderInput={(params) => <TextField {...params} fullWidth size="small" />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="월 비용"
            name="monthlyFee"
            defaultValue={companyData.monthlyFee}
            onBlur={(e) => {
              const value = e.target.value;
              setCompanyData(prev => ({
                ...prev,
                monthlyFee: value
              }));
            }}
            size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start">₩</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>상태</InputLabel>
            <Select
              name="status"
              value={companyData.status}
              onChange={handleChange}
              label="상태"
            >
              <MenuItem value="ACTIVE">사용</MenuItem>
              <MenuItem value="TERMINATED">해지</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {companyData.status === 'TERMINATED' && (
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="해지일자"
              value={companyData.terminationDate}
              onChange={(date) => handleDateChange('terminationDate', date)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}

            />
          </Grid>
        )}
      </Grid>
    </LocalizationProvider>
  );

  const ImageUploadStep = () => {
    const imageFields = [
      { name: 'exteriorImage', label: '외관 사진' },
      { name: 'entranceImage', label: '입구 사진' },
      { name: 'mainPanelImage', label: '메인 분전함 사진' },
      { name: 'etcImage1', label: '기타 사진 1' },
      { name: 'etcImage2', label: '기타 사진 2' },
      { name: 'etcImage3', label: '기타 사진 3' },
      { name: 'etcImage4', label: '기타 사진 4' }
    ];

    return (
      <Grid container spacing={2}>
        {imageFields.map((field) => (
          <Grid item xs={12} sm={6} key={field.name}>
            <Paper sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>
              <input
                type="file"
                accept="image/*"
                id={field.name}
                style={{ display: 'none' }}
                onChange={(e) => handleImageChange(e, field.name)}
              />
              
              {images[field.name] ? (
                <Box>
                  <Box sx={{ position: 'relative', mb: 1 }}>
                    <img
                      src={URL.createObjectURL(images[field.name])}
                      alt={field.label}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveImage(field.name)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                  <label htmlFor={field.name}>
                    <Button
                      component="span"
                      variant="outlined"
                      fullWidth
                      startIcon={<CloudUploadIcon />}
                    >
                      다시 업로드
                    </Button>
                  </label>
                </Box>
              ) : (
                <label htmlFor={field.name}>
                  <Box sx={{
                    height: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                  }}>
                    <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {field.label} 업로드
                    </Typography>
                  </Box>
                </label>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          {showBuildingInfo ? '건축물 정보 입력' : '업체 추가'}
        </DialogTitle>
        
        <DialogContent sx={{ pb: 0, maxHeight: '70vh', overflowY: 'auto' }}>
          {!showBuildingInfo ? (
            <Box component="form" sx={{ mt: 1 }}>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{  fontWeight: 600 }}>
                    기본 정보
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="업체명"
                    name="companyName"
                    value={companyData.companyName}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="전화번호"
                    name="phoneNumber"
                    value={companyData.phoneNumber}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="팩스번호"
                    name="faxNumber"
                    value={companyData.faxNumber}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 600 }}>
                    주소 정보
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="주소"
                      name="address"
                      value={companyData.address}
                      onChange={handleChange}
                      size="small"
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddressSearch}
                      sx={{ 
                        minWidth: '120px',
                        whiteSpace: 'nowrap',
                        bgcolor: '#fff',
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                    >
                      주소 검색
                    </Button>
                  </Box>
                </Grid>

                {companyData.address && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="상세주소"
                      name="detailAddress"
                      value={companyData.detailAddress}
                      onChange={handleChange}
                      size="small"
                      placeholder="상세주소를 입력하세요"
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 600 }}>
                    추가 정보
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="메모"
                    name="notes"
                    value={companyData.notes}
                    onChange={handleChange}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <>
              <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              {activeStep === 0 && (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Grid container spacing={2} sx={{ pt: 1 }}>
                    <Grid item xs={12}>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs={6}>
                          <DatePicker
                            label="건축허가일"
                            value={companyData.buildingPermitDate}
                            onChange={(date) => handleDateChange('buildingPermitDate', date)}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                fullWidth 
                                size="small"
                                sx={{ height: '36px' }}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <DatePicker
                            label="사용승인일"
                            value={companyData.occupancyDate}
                            onChange={(date) => handleDateChange('occupancyDate', date)}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                fullWidth 
                                size="small"
                                sx={{ height: '36px' }} 
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="연면적"
                        name="totalFloorArea"
                        value={companyData.totalFloorArea}
                        onChange={handleChange}
                        InputProps={{
                          endAdornment: <span style={{ color: '#666' }}>m²</span>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="건축면적"
                        name="buildingArea"
                        value={companyData.buildingArea}
                        onChange={handleChange}
                        InputProps={{
                          endAdornment: <span style={{ color: '#666' }}>m²</span>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="세대수"
                        name="numberOfUnits"
                        type="number"
                        value={companyData.numberOfUnits || ""}
                        onChange={handleChange}
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                ml: 1,
                                fontSize: '0.875rem',
                                color: '#666',
                                whiteSpace: 'nowrap', 
                              }}
                            >
                              세대
                            </Box>
                          )
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="건축높이"
                        name="buildingHeight"
                        value={companyData.buildingHeight}
                        onChange={handleChange}
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <span style={{ marginLeft: '5px', color: '#666', fontSize: '0.85rem' }}>m</span>
                          )
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="건축수"
                        name="numberOfBuildings"
                        value={companyData.numberOfBuildings}
                        onChange={handleChange}
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <span 
                              style={{
                                marginLeft: '5px', 
                                color: '#666', 
                                fontSize: '0.85rem',
                                display: 'inline-block',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              개동
                            </span>
                          )
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="경사로"
                        name="ramp"
                        value={companyData.ramp}
                        onChange={handleChange}
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <span 
                              style={{
                                marginLeft: '5px', 
                                color: '#666', 
                                fontSize: '0.85rem',
                                display: 'inline-block',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              개소
                            </span>
                          )
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>주차장 유형</InputLabel>
                        <Select
                          name="parkingLot"
                          value={companyData.parkingLot}
                          onChange={handleChange}
                          size="small"
                        >
                          <MenuItem value="옥내">옥내</MenuItem>
                          <MenuItem value="옥상">옥상</MenuItem>
                          <MenuItem value="옥외">옥외</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {companyData.parkingLot === "옥내" && (
                      <Grid item xs={12}>
                        <Box sx={{
                          border: '1px solid #ddd',
                          borderRadius: 2,
                          p: 2,
                          mt: 1
                        }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            옥내주차장 상세
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {["지하", "지상", "필로티", "기계식"].map((option) => (
                              <Chip
                                key={option}
                                label={option}
                                onClick={() => {
                                  setCompanyData(prev => {
                                    const details = prev.indoorParkingDetail.split('/').map(s => s.trim());
                                    const isSelected = details.includes(option);
                                    
                                    let newDetails;
                                    if (isSelected) {
                                      newDetails = details.filter(d => d !== option);
                                    } else {
                                      newDetails = [...details, option];
                                    }
                                    
                                    return {
                                      ...prev,
                                      indoorParkingDetail: newDetails.filter(Boolean).join(' / ')
                                    };
                                  });
                                }}
                                color={companyData.indoorParkingDetail.includes(option) ? "primary" : "default"}
                                sx={{ 
                                  cursor: 'pointer',
                                  '&:hover': { opacity: 0.8 }
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Grid>
                    )}

                    <Grid item xs={12} sm={12}>
                      <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{ fontSize: "0.9rem", fontWeight: "bold", mb: 1, color: "#333" }}>
                          건축물 구조 선택
                        </FormLabel>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            p: "0.5rem",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <RadioGroup
                            row
                            value={companyData.buildingStructure}
                            onChange={(e) => setCompanyData({ ...companyData, buildingStructure: e.target.value })}
                          >
                            {structureOptions.map((option) => (
                              <FormControlLabel
                                key={option}
                                value={option}
                                control={<Radio sx={{ transform: "scale(0.8)" }} />}
                                label={option}
                                sx={{ ".MuiTypography-root": { fontSize: "0.85rem" } }}
                              />
                            ))}
                          </RadioGroup>
                        </Box>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={12}>
                      <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{ fontSize: "0.9rem", fontWeight: "bold", mb: 1, color: "#333" }}>
                          지붕구조 선택
                        </FormLabel>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            p: "0.5rem",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <RadioGroup
                            row
                            value={companyData.roofStructure}
                            onChange={(e) => setCompanyData({ ...companyData, roofStructure: e.target.value })}
                          >
                            {roofOptions.map((option) => (
                              <FormControlLabel
                                key={option}
                                value={option}
                                control={<Radio sx={{ transform: "scale(0.8)" }} />}
                                label={option}
                                sx={{ ".MuiTypography-root": { fontSize: "0.85rem" } }}
                              />
                            ))}
                          </RadioGroup>
                        </Box>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <FormLabel component="legend" sx={{ fontSize: "0.9rem", fontWeight: "bold", mb: 1, color: "#333" }}>
                        층수 정보
                      </FormLabel>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        p: 2,
                        border: '1px solid #ccc',
                        borderRadius: 2,
                        backgroundColor: '#f9f9f9'
                      }}>
                        <TextField
                          select
                          label="유형"
                          name="floorType"
                          value={companyData.floorType}
                          onChange={handleChange}
                          size="small"
                          sx={{ width: '150px' }}
                        >
                          <MenuItem value="지상">지상</MenuItem>
                          <MenuItem value="지하">지하</MenuItem>
                        </TextField>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            type="number"
                            label="층수"
                            name="floorCount"
                            value={companyData.floorCount}
                            onChange={handleChange}
                            size="small"
                            sx={{ width: '100px' }}
                            InputProps={{
                              inputProps: { min: 1 }
                            }}
                          />
                          <Typography sx={{ ml: 1, color: '#666', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                            층
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <FormLabel component="legend" sx={{ fontSize: "0.9rem", fontWeight: "bold", mb: 1, color: "#333" }}>
                        계단 정보
                      </FormLabel>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        p: 2,
                        border: '1px solid #ccc',
                        borderRadius: 2,
                        backgroundColor: '#f9f9f9'
                      }}>
                        <TextField
                          select
                          label="유형"
                          name="stairsType"
                          value={companyData.stairsType}
                          onChange={handleChange}
                          size="small"
                          sx={{ width: '150px' }}
                        >
                          <MenuItem value="직통(피난계단)">직통(피난계단)</MenuItem>
                          <MenuItem value="특별피난계단">특별피난계단</MenuItem>
                        </TextField>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            type="number"
                            label="개소"
                            name="stairsCount"
                            value={companyData.stairsCount}
                            onChange={handleChange}
                            size="small"
                            sx={{ width: '100px' }}
                            InputProps={{
                              inputProps: { min: 0 }
                            }}
                          />
                          <Typography sx={{ ml: 1, color: '#666', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                            개
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <FormLabel component="legend" sx={{ fontSize: "0.9rem", fontWeight: "bold", mb: 1, color: "#333" }}>
                        승강기 정보
                      </FormLabel>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        p: 2,
                        mb: 2,
                        border: '1px solid #ccc',
                        borderRadius: 2,
                        backgroundColor: '#f9f9f9'

                      }}>
                        <TextField
                          select
                          label="유형"
                          name="elevatorType"
                          value={companyData.elevatorType}
                          onChange={handleChange}
                          size="small"
                          sx={{ width: '150px' }}
                        >
                          <MenuItem value="승용">승용</MenuItem>
                          <MenuItem value="비상용">비상용</MenuItem>
                          <MenuItem value="피난용">피난용</MenuItem>
                        </TextField>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            type="number"
                            label="개수"
                            name="elevatorCount"
                            value={companyData.elevatorCount}
                            onChange={handleChange}
                            size="small"
                            sx={{ width: '100px' }}
                            InputProps={{
                              inputProps: { min: 0 }
                            }}
                          />
                          <Typography sx={{ ml: 1, color: '#666', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                            대
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </LocalizationProvider>
              )}
              
              {activeStep === 1 && <ContractInfoStep />}
              
              {activeStep === 2 && <ImageUploadStep />}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          {!showBuildingInfo ? (
            <>
              <Button 
                onClick={handleClose}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                취소
              </Button>
              <Button
                onClick={() => setShowBuildingInfo(true)}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                추가정보 입력
              </Button>
              <Button 
                onClick={handleSubmit}
                variant="contained"
                sx={{
                  bgcolor: '#1C243A',
                  '&:hover': { bgcolor: '#3d63b8' }
                }}
              >
                저장
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleClose}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                취소
              </Button>
              {activeStep > 0 && (
                <Button 
                  onClick={handleBack}
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  이전
                </Button>
              )}
              {activeStep === steps.length - 1 ? (
                <Button 
                  onClick={handleSubmit}
                  variant="contained"
                  sx={{
                    bgcolor: '#1C243A',
                    '&:hover': { bgcolor: '#3d63b8' }
                  }}
                >
                  완료
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  variant="contained"
                  sx={{
                    bgcolor: '#1C243A',
                    '&:hover': { bgcolor: '#3d63b8' }
                  }}
                >
                  다음
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', boxShadow: 3, fontSize: '0.95rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CompanyDialog; 