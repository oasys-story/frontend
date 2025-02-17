import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const FireSafetyInspectionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    buildingName: '',
    address: '',
    buildingGrade: '',
    inspectionDate: null,
    companyName: '',
    fireExtinguisherStatus: '',
    fireAlarmStatus: '',
    fireEvacuationStatus: '',
    fireWaterStatus: '',
    fireFightingStatus: '',
    etcComment: '',
  });

  useEffect(() => {
    fetchInspectionData();
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
        setFormData({
          ...data,
          inspectionDate: new Date(data.inspectionDate)
        });
      } else {
        console.error('데이터 로딩 실패');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/fire-inspections/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          inspectionDate: formData.inspectionDate.toISOString()
        })
      });

      if (response.ok) {
        navigate(`/fire-safety-inspection/${id}`);
      } else {
        alert('수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ 
        position: 'sticky',   
        top: 0, 
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #eee',
        zIndex: 1,
        p: 2,
        textAlign: 'center'
      }}>
        <Typography variant="h6">소방점검 수정</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>기본 정보</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="점검일자"
                  value={formData.inspectionDate}
                  onChange={(newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      inspectionDate: newValue
                    }));
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="건물명"
                name="buildingName"
                value={formData.buildingName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="주소"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="건물등급"
                name="buildingGrade"
                value={formData.buildingGrade}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="점검업체"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>점검 상태</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="소화설비 상태"
                name="fireExtinguisherStatus"
                value={formData.fireExtinguisherStatus}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="경보설비 상태"
                name="fireAlarmStatus"
                value={formData.fireAlarmStatus}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="피난구조설비 상태"
                name="fireEvacuationStatus"
                value={formData.fireEvacuationStatus}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="소화용수설비 상태"
                name="fireWaterStatus"
                value={formData.fireWaterStatus}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="소화활동설비 상태"
                name="fireFightingStatus"
                value={formData.fireFightingStatus}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="기타 의견"
                name="etcComment"
                value={formData.etcComment}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Paper>

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
            onClick={() => navigate(`/fire-safety-inspection/${id}`)}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ 
              bgcolor: '#1C243A',
              '&:hover': { bgcolor: '#3d63b8' }
            }}
          >
            저장
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default FireSafetyInspectionEdit; 