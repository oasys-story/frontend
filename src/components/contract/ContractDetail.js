import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { pdfjs } from 'react-pdf';
import ContractSignature from './ContractSignature';

// PDF worker 설정 변경
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfFile, setPdfFile] = useState(null);
  const [signatureOpen, setSignatureOpen] = useState(false);

  // options 객체를 useMemo로 메모이제이션
  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  }), []); // 의존성 배열이 비어있으므로 컴포넌트 마운트 시 한 번만 생성

  useEffect(() => {
    fetchContractData();
  }, [id]);

  useEffect(() => {
    if (id) {
      setPdfFile({
        url: `http://localhost:8080/api/contracts/${id}/pdf`,
        httpHeaders: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          'Accept': 'application/pdf'
        },
        withCredentials: true
      });
    }
  }, [id]);

  const fetchContractData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/contracts/${id}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('계약서 상세 데이터:', data); // 데이터 확인용
        setContract(data);
      } else {
        throw new Error('상세 조회 실패');
      }
    } catch (error) {
      console.error('계약서 조회 실패:', error);
      alert('계약서 정보를 불러오는데 실패했습니다.');
      navigate('/contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/contracts/${id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = contract.originalFileName || `contract_${id}.pdf`;
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

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleSignatureComplete = (success) => {
    if (success) {
      fetchContractData(); // 계약서 정보 새로고침
    }
    setSignatureOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!contract) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>계약서를 찾을 수 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/contracts')}
        sx={{ mb: 3 }}
      >
        목록으로
      </Button>

      {/* 계약 정보 섹션 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            {contract.title}
          </Typography>
          <Chip 
            label={contract.status === 'SIGNED' ? '서명완료' : '대기중'} 
            color={contract.status === 'SIGNED' ? 'success' : 'warning'}
            sx={{ fontSize: '1rem', height: 32 }}
          />
        </Box>

        <Grid container spacing={4}>
          {/* 기본 정보 */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                기본 정보
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">계약 번호</Typography>
                  <Typography variant="body1">{contract.contractNumber}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">계약 종류</Typography>
                  <Typography variant="body1">
                    {contract.contractType === 'WORK' ? '근로 계약서' :
                     contract.contractType === 'SERVICE' ? '용역 계약서' :
                     contract.contractType === 'LEASE' ? '임대차 계약서' : '기타 계약서'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">만료일</Typography>
                  <Typography variant="body1">
                    {contract.expirationDate ? 
                      new Date(contract.expirationDate).toLocaleDateString() : 
                      '설정되지 않음'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* 계약자 정보 */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                계약자 정보
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">이름</Typography>
                  <Typography variant="body1">{contract.contractorName}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">이메일</Typography>
                  <Typography variant="body1">{contract.contractorEmail}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">연락처</Typography>
                  <Typography variant="body1">{contract.contractorPhoneNumber}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* 피계약자 정보 */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                피계약자 정보
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">이름</Typography>
                  <Typography variant="body1">{contract.contracteeName}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">이메일</Typography>
                  <Typography variant="body1">{contract.contracteeEmail}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">연락처</Typography>
                  <Typography variant="body1">{contract.contracteePhoneNumber}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        {/* 계약 설명 */}
        {contract.description && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
              계약 설명
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {contract.description}
            </Typography>
          </Box>
        )}

        {/* 버튼 그룹 */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{ minWidth: 150 }}
          >
            PDF 다운로드
          </Button>
          {contract.status !== 'SIGNED' && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setSignatureOpen(true)}
              sx={{ 
                minWidth: 150,
                bgcolor: '#343959',
                '&:hover': { bgcolor: '#3d63b8' }
              }}
            >
              서명하기
            </Button>
          )}
        </Box>
      </Paper>

      {/* PDF 미리보기 섹션 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          계약서 미리보기
        </Typography>
        <Box sx={{ 
          height: '800px', 
          overflow: 'auto',
          bgcolor: '#f5f5f5',
          p: 2,
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<CircularProgress />}
            error={<Typography color="error">PDF 로드에 실패했습니다.</Typography>}
            options={pdfOptions}
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={Math.min(800, window.innerWidth - 100)}
            />
          </Document>
        </Box>
        {numPages > 1 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(pageNumber - 1)}
            >
              이전
            </Button>
            <Typography>
              {pageNumber} / {numPages}
            </Typography>
            <Button 
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber(pageNumber + 1)}
            >
              다음
            </Button>
          </Box>
        )}
      </Paper>

      {/* Dialog 추가 */}
      <ContractSignature
        open={signatureOpen}
        onClose={handleSignatureComplete}
        contractId={id}
      />
    </Box>
  );
};

export default ContractDetail; 