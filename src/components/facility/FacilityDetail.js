import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Tooltip,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Timeline as TimelineIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers';

const FacilityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [contractForm, setContractForm] = useState({
    contractNumber: '',
    startDate: null,
    endDate: null,
    contractAmount: '',
    isPaid: false,
    vendorName: '',
    vendorContact: '',
    description: ''
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    currentLocation: '',
    description: '',
    status: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [editContractDialogOpen, setEditContractDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [editContractForm, setEditContractForm] = useState({
    contractNumber: '',
    startDate: null,
    endDate: null,
    contractAmount: '',
    isPaid: false,
    paidDate: null,
    vendorName: '',
    vendorContact: '',
    description: ''
  });

  const statusColors = {
    IN_USE: 'success',
    DISPOSED: 'error',
    LOST: 'warning',
    SOLD: 'info',
    MOVED: 'default'
  };

  const statusText = {
    IN_USE: '사용중',
    DISPOSED: '폐기',
    LOST: '분실',
    SOLD: '매각',
    MOVED: '이동'
  };

  useEffect(() => {
    fetchFacilityDetail();
  }, [id]);

  const fetchFacilityDetail = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/facilities/${id}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFacility(data);
        setEditForm({
          currentLocation: data.currentLocation || '',
          description: data.description || '',
          status: data.status || ''
        });
      }
    } catch (error) {
      console.error('시설물 상세 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/facilities/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote
        })
      });

      if (response.ok) {
        fetchFacilityDetail();
        setStatusDialogOpen(false);
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
    }
  };

  const handleContractSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/facilities/${id}/contracts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contractForm)
      });

      if (response.ok) {
        fetchFacilityDetail();
        setContractDialogOpen(false);
        setContractForm({
          contractNumber: '',
          startDate: null,
          endDate: null,
          contractAmount: '',
          isPaid: false,
          vendorName: '',
          vendorContact: '',
          description: ''
        });
      }
    } catch (error) {
      console.error('계약 등록 실패:', error);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/facilities/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentLocation: editForm.currentLocation,
          description: editForm.description,
          status: editForm.status,
          companyId: facility.companyId,
          name: facility.name,
          code: facility.code,
          location: facility.location,
          acquisitionCost: facility.acquisitionCost,
          acquisitionDate: facility.acquisitionDate
        })
      });

      if (response.ok) {
        fetchFacilityDetail();
        setEditDialogOpen(false);
      }
    } catch (error) {
      console.error('시설물 정보 수정 실패:', error);
    }
  };

  const handleOpenEditContract = (contract) => {
    setSelectedContract(contract);
    setEditContractForm({
      contractNumber: contract.contractNumber,
      startDate: contract.startDate,
      endDate: contract.endDate,
      contractAmount: contract.contractAmount,
      isPaid: contract.isPaid,
      paidDate: contract.paidDate,
      vendorName: contract.vendorName,
      vendorContact: contract.vendorContact,
      description: contract.description
    });
    setEditContractDialogOpen(true);
  };

  const handleUpdateContract = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/facilities/${id}/contracts/${selectedContract.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editContractForm)
        }
      );

      if (response.ok) {
        fetchFacilityDetail();
        setEditContractDialogOpen(false);
      }
    } catch (error) {
      console.error('계약 정보 수정 실패:', error);
    }
  };

  if (loading || !facility) {
    return <Box sx={{ p: 3 }}>로딩중...</Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        {/* 헤더 */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/facility')} sx={{ color: 'text.secondary' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">{facility.name}</Typography>
          <Chip 
            label={statusText[facility.status]} 
            color={statusColors[facility.status]}
            sx={{ ml: 'auto' }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* 기본 정보 */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                기본 정보
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon sx={{ color: 'text.secondary' }} />
                    <Typography>{facility.companyName}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon sx={{ color: 'text.secondary' }} />
                    <Typography>{facility.currentLocation}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon sx={{ color: 'text.secondary' }} />
                    <Typography>{facility.acquisitionCost?.toLocaleString()}원</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            {/* 상태 변경 이력 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                상태 변경 이력
              </Typography>
              {facility.statusHistory?.map((history, index) => (
                <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(history.changeDate).toLocaleDateString()}
                  </Typography>
                  <Typography>
                    {statusText[history.status]} - {history.note}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* 이미지 갤러리 */}
        <Box sx={{ mt: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2 
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              이미지 ({facility.images?.length})
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => {/* 이미지 추가 기능 */}}
              sx={{ color: '#343959' }}
            >
              이미지 추가
            </Button>
          </Box>
          <Grid container spacing={2}>
            {facility.images?.map((image, index) => (
              <Grid item xs={6} sm={4} md={3} key={image.id}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '100%', // 1:1 비율 유지
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedImage(image)}
                >
                  <Box
                    component="img"
                    src={`http://localhost:8080/api/facilities/images/${image.url}`}
                    alt={image.description || `시설물 이미지 ${index + 1}`}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = '/default-facility.jpg';
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 계약 정보 */}
        <Box sx={{ mt: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2 
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              계약 정보
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setContractDialogOpen(true)}
              sx={{ color: '#343959' }}
            >
              계약 등록
            </Button>
          </Box>

          <Stack spacing={2}>
            {facility.contracts?.map((contract, index) => (
              <Paper 
                key={index} 
                elevation={3} 
                sx={{ 
                  p: 2,
                  bgcolor: 'background.paper',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    bgcolor: contract.isPaid ? 'success.main' : 'warning.main',
                    borderTopLeftRadius: 4,
                    borderBottomLeftRadius: 4
                  }
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {new Date(contract.startDate).toLocaleDateString()} ~ 
                      {new Date(contract.endDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">
                      {contract.vendorName}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      계약번호: {contract.contractNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">
                        {contract.contractAmount?.toLocaleString()}원
                      </Typography>
                      <Chip 
                        label={contract.isPaid ? '지급완료' : '미지급'} 
                        color={contract.isPaid ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  {contract.description && (
                    <Grid item xs={12}>
                      <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {contract.description}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
                <IconButton 
                  size="small" 
                  onClick={() => handleOpenEditContract(contract)}
                  sx={{ color: 'primary.main' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Paper>
            ))}
          </Stack>
        </Box>

        {/* 하단 버튼 */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
            sx={{
              bgcolor: '#343959',
              '&:hover': { bgcolor: '#3d63b8' }
            }}
          >
            정보 수정
          </Button>
        </Box>
      </Paper>

      {/* 이미지 확대 보기 다이얼로그 */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setSelectedImage(null)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <Box
              sx={{
                width: '100%',
                height: '80vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: 'black'
              }}
            >
              <Box
                component="img"
                src={`http://localhost:8080/api/facilities/images/${selectedImage.url}`}
                alt={selectedImage.description || "시설물 이미지"}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
              {selectedImage.description && (
                <Typography
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    color: 'white',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    textAlign: 'center'
                  }}
                >
                  {selectedImage.description}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* 계약 등록 다이얼로그 */}
      <Dialog 
        open={contractDialogOpen} 
        onClose={() => setContractDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>계약 정보 등록</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="계약 번호"
                  name="contractNumber"
                  value={contractForm.contractNumber}
                  onChange={(e) => setContractForm(prev => ({
                    ...prev,
                    contractNumber: e.target.value
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="계약 시작일"
                    value={contractForm.startDate}
                    onChange={(newValue) => setContractForm(prev => ({
                      ...prev,
                      startDate: newValue
                    }))}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="계약 종료일"
                    value={contractForm.endDate}
                    onChange={(newValue) => setContractForm(prev => ({
                      ...prev,
                      endDate: newValue
                    }))}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="계약 금액"
                  name="contractAmount"
                  type="number"
                  value={contractForm.contractAmount}
                  onChange={(e) => setContractForm(prev => ({
                    ...prev,
                    contractAmount: e.target.value
                  }))}
                  InputProps={{
                    endAdornment: <Typography>원</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="업체명"
                  name="vendorName"
                  value={contractForm.vendorName}
                  onChange={(e) => setContractForm(prev => ({
                    ...prev,
                    vendorName: e.target.value
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="연락처"
                  name="vendorContact"
                  value={contractForm.vendorContact}
                  onChange={(e) => setContractForm(prev => ({
                    ...prev,
                    vendorContact: e.target.value
                  }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="설명"
                  name="description"
                  value={contractForm.description}
                  onChange={(e) => setContractForm(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContractDialogOpen(false)}>취소</Button>
          <Button 
            onClick={handleContractSubmit}
            variant="contained"
            sx={{ bgcolor: '#343959', '&:hover': { bgcolor: '#3d63b8' } }}
          >
            등록
          </Button>
        </DialogActions>
      </Dialog>

      {/* 정보 수정 다이얼로그 */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>시설물 정보 수정</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    시설물명
                  </Typography>
                  <Typography variant="body1">
                    {facility.name}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    관리 코드
                  </Typography>
                  <Typography variant="body1">
                    {facility.code}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="상태"
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    status: e.target.value
                  }))}
                  sx={{ mb: 2 }}
                >
                  {Object.entries(statusText).map(([key, value]) => (
                    <MenuItem key={key} value={key}>{value}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="현재 위치"
                  value={editForm.currentLocation}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    currentLocation: e.target.value
                  }))}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="설명"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>취소</Button>
          <Button 
            onClick={handleEdit}
            variant="contained"
            sx={{ bgcolor: '#343959', '&:hover': { bgcolor: '#3d63b8' } }}
          >
            수정
          </Button>
        </DialogActions>
      </Dialog>

      {/* 계약 정보 수정 다이얼로그 */}
      <Dialog
        open={editContractDialogOpen}
        onClose={() => setEditContractDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>계약 정보 수정</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="계약 번호"
                  value={editContractForm.contractNumber}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="계약 금액"
                  value={editContractForm.contractAmount}
                  disabled
                  InputProps={{
                    endAdornment: <Typography>원</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="업체명"
                  value={editContractForm.vendorName}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="연락처"
                  value={editContractForm.vendorContact}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editContractForm.isPaid}
                      onChange={(e) => setEditContractForm(prev => ({
                        ...prev,
                        isPaid: e.target.checked,
                        paidDate: e.target.checked ? new Date() : null
                      }))}
                    />
                  }
                  label="대금 지급 완료"
                />
              </Grid>
              {editContractForm.isPaid && (
                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="지급일"
                      value={editContractForm.paidDate}
                      onChange={(newValue) => setEditContractForm(prev => ({
                        ...prev,
                        paidDate: newValue
                      }))}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditContractDialogOpen(false)}>
            취소
          </Button>
          <Button
            onClick={handleUpdateContract}
            variant="contained"
            sx={{ bgcolor: '#343959', '&:hover': { bgcolor: '#3d63b8' } }}
          >
            수정
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilityDetail; 