import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';

const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/contracts', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('받아온 데이터:', data); // 데이터 확인용
        setContracts(Array.isArray(data) ? data : []);
      } else {
        throw new Error('목록 조회 실패');
      }
    } catch (error) {
      console.error('계약서 목록 조회 실패:', error);
      alert('계약서 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (contractId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/contracts/${contractId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contract_${contractId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (error) {
      console.error('PDF 다운로드 실패:', error);
      alert('PDF 다운로드에 실패했습니다.');
    }
  };

  const handleView = (contractId) => {
    navigate(`/contracts/${contractId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          계약서 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadFileIcon />}
          onClick={() => navigate('/contract/upload')}
          sx={{ 
            bgcolor: '#343959',
            '&:hover': { bgcolor: '#3d63b8' }
          }}
        >
          계약서 업로드
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>계약번호</TableCell>
              <TableCell>계약명</TableCell>
              <TableCell>계약자</TableCell>
              <TableCell>피계약자</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>등록일</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.length > 0 ? (
              contracts.map((contract) => (
                <TableRow 
                  key={contract.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleView(contract.id)}
                >
                  <TableCell>{contract.contractNumber}</TableCell>
                  <TableCell>{contract.title}</TableCell>
                  <TableCell>{contract.contractorName}</TableCell>
                  <TableCell>{contract.contracteeName}</TableCell>
                  <TableCell>
                    <Chip 
                      label={contract.status === 'SIGNED' ? '서명완료' : '대기중'} 
                      color={contract.status === 'SIGNED' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {contract.createdDate && new Date(contract.createdDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(contract.id);
                      }}
                      size="small"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "등록된 계약서가 없습니다."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ContractList; 