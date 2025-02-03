import React, { useState } from 'react';
import { IconButton, CircularProgress, Tooltip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import lamejs from 'lamejs';

const VoiceRecorder = ({ onTranscriptionComplete, label }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // WebM을 WAV로 변환하는 함수
  const convertToWav = async (webmBlob) => {
    // console.log('WAV 변환 시작...');

    const audioContext = new AudioContext();
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // WAV로 변환
    const wavBlob = await audioBufferToWav(audioBuffer);
    // console.log('WAV 변환 완료');

    return new Blob([wavBlob], { type: 'audio/wav' });
  };

  // AudioBuffer를 WAV로 변환
  const audioBufferToWav = (buffer) => {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    let result = new Float32Array(buffer.length * numberOfChannels);
    
    // 인터리브 오디오 데이터
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        result[i * numberOfChannels + channel] = channelData[i];
      }
    }
    
    // WAV 헤더 생성
    const dataSize = result.length * (bitDepth / 8);
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    
    // WAV 헤더 작성
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * (bitDepth / 8), true);
    view.setUint16(32, numberOfChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    // 최종 WAV 파일 생성
    const audioData = new Int16Array(result.length);
    for (let i = 0; i < result.length; i++) {
      const s = Math.max(-1, Math.min(1, result[i]));
      audioData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    const wavFile = new Uint8Array(header.byteLength + audioData.length * 2);
    wavFile.set(new Uint8Array(header), 0);
    wavFile.set(new Uint8Array(audioData.buffer), header.byteLength);
    
    return wavFile;
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const startRecording = async () => {
    try {
    //   console.log('녹음 시작 시도...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1
        } 
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      });
      
      const audioChunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
        //   console.log(`청크 데이터 수신: ${e.data.size} bytes`);
          audioChunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        setIsProcessing(true);
        try {
          const webmBlob = new Blob(audioChunks, { type: 'audio/webm' });
        //   console.log(`WebM 녹음 완료: ${webmBlob.size} bytes`);
          
          const wavBlob = await convertToWav(webmBlob);
        //   console.log(`WAV 변환 완료: ${wavBlob.size} bytes`);
          
          await sendAudioToServer(wavBlob);
        } finally {
          setIsProcessing(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      recorder.start(100);
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('녹음 시작 실패:', error);
      alert('마이크 접근에 실패했습니다. 마이크 권한을 확인해주세요.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToServer = async (audioBlob) => {
    // 서버로 전송하기 전 파일 크기와 내용 확인
    // console.log('서버 전송 전 오디오:', {
    //     size: audioBlob.size,
    //     type: audioBlob.type,
    //     content: await audioBlob.arrayBuffer()
    // });

    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');

    try {
      const response = await fetch('http://localhost:8080/api/stt/convert', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const text = await response.text();
        onTranscriptionComplete(text);
      } else {
        const errorText = await response.text();
        console.error('STT 변환 실패:', errorText);
        alert('음성 인식에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('서버 요청 실패:', error);
      alert('서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.');
    }
  };

  const getTooltipTitle = () => {
    if (isProcessing) return '음성 변환 중...';
    if (isRecording) return '클릭하여 녹음 중지';
    return `${label} 음성 입력`;
  };

  return (
    <Tooltip title={getTooltipTitle()}>
      <span>
        <IconButton
          size="small"
          color={isRecording ? 'error' : 'primary'}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          sx={{
            animation: isRecording ? 'pulse 1.5s infinite' : 'none',
            '@keyframes pulse': {
              '0%': {
                opacity: 1,
              },
              '50%': {
                opacity: 0.5,
              },
              '100%': {
                opacity: 1,
              },
            }
          }}
        >
          {isProcessing ? (
            <CircularProgress size={20} />
          ) : isRecording ? (
            <StopCircleIcon fontSize="small" />
          ) : (
            <MicIcon fontSize="small" />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default VoiceRecorder; 