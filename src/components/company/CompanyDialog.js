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
  Checkbox,
  Typography,
  Chip,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({
      ...prev,
      [name]: value
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
      };

      await onSubmit(formattedData);
      setSnackbar({
        open: true,
        message: '업체가 성공적으로 등록되었습니다.',
        severity: 'success'
      });
      handleClose();
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

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
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
                onClick={() => setShowBuildingInfo(false)}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                이전
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