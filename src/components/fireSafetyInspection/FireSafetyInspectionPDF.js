import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Pretendard 폰트 등록
Font.register({
  family: 'Pretendard',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Regular.woff',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Bold.woff',
      fontWeight: 'bold',
    }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Pretendard',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 15,
    border: '1pt solid #1C243A',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #1C243A',
    minHeight: 30,
    alignItems: 'center',
  },
  headerCell: {
    width: '25%',
    padding: 5,
    backgroundColor: '#1C243A',
    color: '#FFFFFF',
    borderRight: '1pt solid #1C243A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerValue: {
    width: '25%',
    padding: 5,
    borderRight: '1pt solid #1C243A',
    fontSize: 10,
  },
  inspectionSection: {
    marginBottom: 10,
    border: '1pt solid #1C243A',
    flex: 1,
  },
  inspectionContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  inspectionMainHeader: {
    flexDirection: 'row',
    borderBottom: '1pt solid #1C243A',
    backgroundColor: '#1C243A',
    minHeight: 40,
  },
  inspectionHeaderLeft: {
    width: '20%',
    padding: 8,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    borderRight: '1pt solid #FFFFFF',
  },
  inspectionHeaderRight: {
    flex: 1,
    padding: 8,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  inspectionRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #1C243A',
    minHeight: 71,
  },
  inspectionLabel: {
    width: '20%',
    padding: 10,
    borderRight: '1pt solid #1C243A',
    fontSize: 11,
    alignSelf: 'stretch',
  },
  inspectionValue: {
    flex: 1,
    padding: 10,
    fontSize: 11,
    alignSelf: 'stretch',
    maxWidth: '80%',
  },
  valueText: {
    maxWidth: '100%',
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap',
  },
  signatureSection: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 90,
  },
  signatureBox: {
    width: '45%',
    border: '1pt solid #1C243A',
    padding: 5,
  },
  signatureTitle: {
    textAlign: 'center',
    marginBottom: 5,
    color: '#1C243A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  signatureImage: {
    width: '100%',
    height: 60,
    objectFit: 'contain',
  },
  footer: {
    marginTop: 15,
    textAlign: 'center',
    color: '#1C243A',
  },
  imagesContainer: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
  },
  imageWrapper: {
    width: '50%',  // 레이아웃은 50:50 유지
    padding: 5,
    height: 200,   // 이미지 컨테이너 높이 고정
    display: 'flex',
    alignItems: 'center',  // 이미지 가운데 정렬
    justifyContent: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',  // 'cover' 대신 'contain' 사용하여 비율 유지
  },
  imageCaption: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 10,
    backgroundColor: '#1C243A',
    color: 'white',
    padding: 5,
    marginBottom: 5,
    fontFamily: 'Pretendard',
    fontWeight: 'bold', 
  },
});


const FireSafetyInspectionPDF = ({ inspection }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>소방안전관리업무 대행 점검표</Text>

        {/* 기본 정보 */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>건물명</Text>
            <Text style={[styles.headerValue, { width: '75%' }]}>{inspection.buildingName}</Text>
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>주소</Text>
            <Text style={[styles.headerValue, { width: '75%' }]}>{inspection.address}</Text>
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>점검일자</Text>
            <Text style={styles.headerValue}>{formatDate(inspection.inspectionDate)}</Text>
            <Text style={styles.headerCell}>건물등급</Text>
            <Text style={styles.headerValue}>{inspection.buildingGrade}</Text>
          </View>
        </View>

        {/* 점검결과 세부사항 */}
        <View style={styles.inspectionSection}>
          <View style={styles.inspectionMainHeader}>
            <Text style={styles.inspectionHeaderLeft}>설비명</Text>
            <Text style={styles.inspectionHeaderRight}>점검결과 세부사항</Text>
          </View>
          <View style={styles.inspectionContent}>
            <View style={styles.inspectionRow}>
              <Text style={styles.inspectionLabel}>소화설비</Text>
              <View style={styles.inspectionValue}>
                <Text style={styles.valueText}>
                  {inspection.fireExtinguisherStatus?.match(/.{1,40}/g)?.join('\n') || ''}
                </Text>
              </View>
            </View>
            <View style={styles.inspectionRow}>
              <Text style={styles.inspectionLabel}>경보설비</Text>
              <View style={styles.inspectionValue}>
                <Text style={styles.valueText}>
                  {inspection.fireAlarmStatus?.match(/.{1,40}/g)?.join('\n') || ''}
                </Text>
              </View>
            </View>
            <View style={styles.inspectionRow}>
              <Text style={styles.inspectionLabel}>피난구조설비</Text>
              <View style={styles.inspectionValue}>
                <Text style={styles.valueText}>
                  {inspection.fireEvacuationStatus?.match(/.{1,40}/g)?.join('\n') || ''}
                </Text>
              </View>
            </View>
            <View style={styles.inspectionRow}>
              <Text style={styles.inspectionLabel}>소화용수설비</Text>
              <View style={styles.inspectionValue}>
                <Text style={styles.valueText}>
                  {inspection.fireWaterStatus?.match(/.{1,40}/g)?.join('\n') || ''}
                </Text>
              </View>
            </View>
            <View style={styles.inspectionRow}>
              <Text style={styles.inspectionLabel}>소화활동설비</Text>
              <View style={styles.inspectionValue}>
                <Text style={styles.valueText}>
                  {inspection.fireFightingStatus?.match(/.{1,40}/g)?.join('\n') || ''}
                </Text>
              </View>
            </View>
            <View style={[styles.inspectionRow, { borderBottom: 'none' }]}>
              <Text style={styles.inspectionLabel}>기타</Text>
              <View style={styles.inspectionValue}>
                <Text style={styles.valueText}>
                  {inspection.etcComment?.match(/.{1,40}/g)?.join('\n') || ''}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 서명 섹션 */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>점검자</Text>
            {inspection.inspectorSignature && (
              <Image style={styles.signatureImage} src={inspection.inspectorSignature} />
            )}
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>관리자</Text>
            {inspection.managerSignature && (
              <Image style={styles.signatureImage} src={inspection.managerSignature} />
            )}
          </View>
        </View>

        {/* 푸터 */}
        <View style={styles.footer}>
          <Text>소방시설 점검업체: {inspection.companyName}</Text>
        </View>

        {/* 이미지 섹션 */}
        <ImagesSection attachments={inspection.attachments} />
      </Page>
    </Document>
  );
};

// 이미지 섹션 컴포넌트 수정
const ImagesSection = ({ attachments }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <View style={styles.section} break>
      <Text style={styles.sectionTitle}>현장 사진</Text>
      <View style={styles.imagesContainer}>
        {attachments.map((image, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image
              src={`http://localhost:8080/uploads/fire-safety-images/${image}`}
              style={styles.image}
            />
            <Text style={styles.imageCaption}>현장사진 {index + 1}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default FireSafetyInspectionPDF; 