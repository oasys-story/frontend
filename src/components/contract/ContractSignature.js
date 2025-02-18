import React, { useState, useRef, useEffect } from 'react';

import {

  Dialog,

  DialogTitle,

  DialogContent,

  DialogActions,

  Button,

  Box,

  Typography,

  IconButton,

  CircularProgress

} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import UndoIcon from '@mui/icons-material/Undo';

import { Document, Page } from 'react-pdf';

import SignatureCanvas from 'react-signature-canvas';



const ContractSignature = ({ open, onClose, contractId }) => {

  const [numPages, setNumPages] = useState(null);

  const [pageNumber, setPageNumber] = useState(1);

  const [loading, setLoading] = useState(false);

  const [signatureMode, setSignatureMode] = useState(false);

  const [selectedPosition, setSelectedPosition] = useState(null);

  const signatureRef = useRef();

  const [pdfFile, setPdfFile] = useState(null);

  const [previewPosition, setPreviewPosition] = useState(null);

  const [signatureData, setSignatureData] = useState(null);

  const pageRef = useRef(null);

  const [scale, setScale] = useState({ x: 1, y: 1 });



  // PDF 페이지 크기를 고정

  const PDF_WIDTH = 900;  // PDF 기본 너비

  const PDF_HEIGHT = 1164; // PDF 기본 높이



  // 고정된 서명 크기 설정

  const SIGNATURE_WIDTH = 200;

  const SIGNATURE_HEIGHT = 100;



  useEffect(() => {

    if (contractId) {

      setPdfFile({

        url: `http://localhost:8080/api/contracts/${contractId}/pdf`,

        httpHeaders: {

          'Authorization': `Bearer ${sessionStorage.getItem('token')}`

        }

      });

    }

  }, [contractId]);



  const calculateScale = () => {

    const canvas = document.querySelector('.react-pdf__Page canvas');

    const page = document.querySelector('.react-pdf__Page');

    

    if (canvas && page) {

      setScale({

        x: canvas.width / page.offsetWidth,

        y: canvas.height / page.offsetHeight

      });

    }

  };



  const handleDocumentLoadSuccess = ({ numPages }) => {

    setNumPages(numPages);

    setTimeout(calculateScale, 100);

  };



  const handleSignatureChange = () => {

    if (signatureRef.current && !signatureRef.current.isEmpty()) {

      setSignatureData(signatureRef.current.toDataURL());

    }

  };



  const handlePageClick = (event) => {

    if (!signatureMode) return;



    const rect = pageRef.current.getBoundingClientRect();

    const page = document.querySelector('.react-pdf__Page');

    const canvas = page.querySelector('canvas');

    

    // 클릭 위치 (화면 좌표)

    const clickX = event.clientX - rect.left;

    const clickY = event.clientY - rect.top;

    

    // 정규화된 좌표 계산 (0~1 사이의 값)

    const normX = clickX / page.offsetWidth;

    const normY = clickY / page.offsetHeight;

    

    // 화면에 표시할 좌표 (중앙 정렬)

    const displayX = clickX - (SIGNATURE_WIDTH / 2);

    const displayY = clickY - (SIGNATURE_HEIGHT / 2);



    // PDF 실제 크기 기준으로 좌표 계산

    const pdfX = canvas.width * normX;

    const pdfY = canvas.height * normY;



    console.log('서명 정보:', {

      화면크기: { width: page.offsetWidth, height: page.offsetHeight },

      PDF크기: { width: canvas.width, height: canvas.height },

      클릭위치: { x: clickX, y: clickY },

      정규화좌표: { x: normX, y: normY },

      PDF좌표: { x: pdfX, y: pdfY }

    });



    setSelectedPosition({

      pageNumber: pageNumber - 1,

      x: pdfX,

      y: pdfY,

      width: SIGNATURE_WIDTH,

      height: SIGNATURE_HEIGHT,

      // 정규화된 좌표 추가

      normX,

      normY,

      // 화면 표시용 좌표

      displayX,

      displayY

    });



    setSignatureMode(false);

    setPreviewPosition(null);

  };



  const handleMouseMove = (event) => {

    if (!signatureMode) return;



    const rect = pageRef.current.getBoundingClientRect();

    const page = document.querySelector('.react-pdf__Page');

    

    const x = event.clientX - rect.left;

    const y = event.clientY - rect.top;

    

    setPreviewPosition({ x, y });

  };



  const handleMouseLeave = () => {

    if (signatureMode) {

      setPreviewPosition(null);

    }

  };



  const handleSignatureSubmit = async () => {

    if (!selectedPosition || !signatureData) {

      alert('서명 위치를 선택하고 서명을 해주세요.');

      return;

    }



    setLoading(true);

    try {

      const positionResponse = await fetch(

        `http://localhost:8080/api/contracts/${contractId}/signature-position`,

        {

          method: 'POST',

          headers: {

            'Content-Type': 'application/json',

            'Authorization': `Bearer ${sessionStorage.getItem('token')}`

          },

          body: JSON.stringify(selectedPosition)

        }

      );



      if (!positionResponse.ok) throw new Error('서명 위치 저장 실패');



      const blob = await (await fetch(signatureData)).blob();

      const formData = new FormData();

      formData.append('signature', blob, 'signature.png');



      const signatureResponse = await fetch(

        `http://localhost:8080/api/contracts/${contractId}/signature`,

        {

          method: 'POST',

          headers: {

            'Authorization': `Bearer ${sessionStorage.getItem('token')}`

          },

          body: formData

        }

      );



      if (!signatureResponse.ok) throw new Error('서명 업로드 실패');



      onClose(true);

    } catch (error) {

      console.error('서명 처리 실패:', error);

      alert('서명 처리에 실패했습니다.');

    } finally {

      setLoading(false);

    }

  };



  return (

    <Dialog 

      open={open} 

      onClose={() => !loading && onClose()}

      maxWidth="md"

      fullWidth

    >

      <DialogTitle>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          <Typography variant="h6">계약서 서명</Typography>

          <IconButton onClick={() => !loading && onClose()}>

            <CloseIcon />

          </IconButton>

        </Box>

      </DialogTitle>



      <DialogContent>

        <Box sx={{ display: 'flex', gap: 2, height: '600px' }}>

          <Box sx={{ 

            flex: 2,

            border: '1px solid #eee',

            overflow: 'auto',

            position: 'relative'

          }}>

            <div 

              ref={pageRef}

              onClick={handlePageClick}

              onMouseMove={handleMouseMove}

              onMouseLeave={handleMouseLeave}

              style={{ position: 'relative' }}

            >

              <Document

                file={pdfFile}

                onLoadSuccess={handleDocumentLoadSuccess}

                loading={<CircularProgress />}

              >

                <Page

                  pageNumber={pageNumber}

                  renderTextLayer={false}

                  renderAnnotationLayer={false}

                  width={800}  // 너비 고정

                  height={1035} // 높이는 비율에 맞게 자동 조정

                />

              </Document>



              {/* 서명 위치 미리보기 */}

              {signatureMode && previewPosition && (

                <Box

                  sx={{

                    position: 'absolute',

                    left: previewPosition.x - (SIGNATURE_WIDTH / 2),

                    top: previewPosition.y - (SIGNATURE_HEIGHT / 2),

                    width: SIGNATURE_WIDTH,

                    height: SIGNATURE_HEIGHT,

                    border: '2px dashed #1976d2',

                    backgroundColor: 'rgba(25, 118, 210, 0.1)',

                    pointerEvents: 'none',

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center',

                    zIndex: 1

                  }}

                >

                  <Typography>클릭하여 서명 위치 선택</Typography>

                </Box>

              )}



              {/* 선택된 서명 영역 */}

              {selectedPosition && !signatureMode && (

                <Box

                  sx={{

                    position: 'absolute',

                    left: selectedPosition.displayX,

                    top: selectedPosition.displayY,

                    width: SIGNATURE_WIDTH,

                    height: SIGNATURE_HEIGHT,

                    border: '2px solid #4caf50',

                    backgroundColor: 'rgba(76, 175, 80, 0.1)',

                    pointerEvents: 'none',

                    zIndex: 1

                  }}

                />

              )}



              {/* 서명 이미지 */}

              {selectedPosition && signatureData && !signatureMode && (

                <Box

                  component="img"

                  src={signatureData}

                  sx={{

                    position: 'absolute',

                    left: selectedPosition.displayX,

                    top: selectedPosition.displayY,

                    width: SIGNATURE_WIDTH,

                    height: SIGNATURE_HEIGHT,

                    pointerEvents: 'none',

                    zIndex: 2

                  }}

                />

              )}

            </div>

          </Box>



          <Box sx={{ 

            flex: 1,

            display: 'flex',

            flexDirection: 'column',

            gap: 2

          }}>

            <Button

              variant="outlined"

              onClick={() => {

                setSignatureMode(!signatureMode);

                if (!signatureMode) {

                  setSelectedPosition(null);

                  setSignatureData(null);

                  if (signatureRef.current) {

                    signatureRef.current.clear();

                  }

                }

              }}

              disabled={loading}

            >

              {signatureMode ? '서명 위치 선택 중...' : '서명 위치 선택'}

            </Button>



            <Box sx={{ flex: 1 }}>

              <Typography variant="subtitle2" gutterBottom>

                서명하기

              </Typography>

              <Box sx={{ 

                border: '1px solid #ccc',

                borderRadius: 1,

                backgroundColor: '#fff'

              }}>

                <SignatureCanvas

                  ref={signatureRef}

                  onEnd={handleSignatureChange}

                  canvasProps={{

                    width: 300,

                    height: 200,

                    className: 'signature-canvas'

                  }}

                />

              </Box>

              <Button 

                onClick={() => {

                  signatureRef.current.clear();

                  setSignatureData(null);

                }}

                disabled={loading}

                startIcon={<UndoIcon />}

                sx={{ mt: 1 }}

              >

                다시 그리기

              </Button>

            </Box>

          </Box>

        </Box>

      </DialogContent>



      <DialogActions>

        <Button 

          onClick={() => !loading && onClose()}

          disabled={loading}

        >

          취소

        </Button>

        <Button

          variant="contained"

          onClick={handleSignatureSubmit}

          disabled={loading || !selectedPosition || !signatureData}

        >

          {loading ? <CircularProgress size={24} /> : '서명 완료'}

        </Button>

      </DialogActions>

    </Dialog>

  );

};



export default ContractSignature; 