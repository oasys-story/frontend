import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';

/* 서명 컴포넌트 */
const SignatureDialog = ({ open, onClose, onConfirm }) => {
  let sigPad = {};  // 서명 패드 참조 저장

  const handleClear = () => {
    sigPad.clear(); // 서명 패드 초기화
  };

  const handleSave = () => {
    if (!sigPad.isEmpty()) {
      const signatureData = sigPad.toDataURL();  // 서명을 Base64 이미지로 변환
      onConfirm(signatureData); // 서명 데이터를 부모 컴포넌트로 전달
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>서명해 주세요</DialogTitle>
      <DialogContent>
        <Box sx={{ border: '1px solid #ccc', mt: 2 }}>
          <SignatureCanvas
            ref={(ref) => { sigPad = ref }} // 서명 패드 참조 설정
            canvasProps={{
              width: 500,
              height: 200,
              className: 'signature-canvas'
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClear}>지우기</Button>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained">확인</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignatureDialog; 