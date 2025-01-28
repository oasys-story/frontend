import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import InspectionForm from './InspectionForm';

const InspectionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInspectionData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/inspections/${id}/detail`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('점검 데이터를 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        // measurements가 문자열이면 파싱
        if (typeof data.measurements === 'string') {
          data.measurements = JSON.parse(data.measurements);
        }
        setInitialData(data);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInspectionData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Box sx={{ p: 2, color: 'error.main' }}>{error}</Box>;
  }

  return (
    <InspectionForm 
      isEdit={true}
      initialData={initialData}
      inspectionId={id}
    />
  );
};

export default InspectionEdit; 