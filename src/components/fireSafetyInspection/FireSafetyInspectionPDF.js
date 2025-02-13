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
    position: 'relative',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 15,
    border: '1pt solid #808080',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #808080',
    alignItems: 'stretch',
  },
  headerCell: {
    backgroundColor: '#808080',
    color: 'white',
    padding: 5,
    width: '20%',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  headerValue: {
    padding: 5,
    fontSize: 10,
    border: '1px solid #808080',
    width: '30%',
  },
  inspectionSection: {
    marginBottom: 35,
    border: '1pt solid #808080',
  },
  inspectionContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  inspectionMainHeader: {
    flexDirection: 'row',
    borderBottom: '1pt solid #808080',
    backgroundColor: '#808080',
    minHeight: 35,
  },
  inspectionHeaderLeft: {
    width: '20%',
    padding: 10,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    borderRight: '1pt solid #FFFFFF',
  },
  inspectionHeaderRight: {
    flex: 1,
    padding: 10,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  inspectionRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #808080',
    minHeight: 60,
  },
  inspectionLabel: {
    width: '20%',
    padding: 10,
    borderRight: '1pt solid #808080',
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
    width: 100,
    height: 35,
    border: '1pt solid #808080',
    marginLeft: 10,
  },
  signatureTitle: {
    textAlign: 'center',
    marginBottom: 5,
    color: '#808080',
    fontSize: 10,
    fontWeight: 'bold',
  },
  signatureImage: {
    width: '100%',
    height: 60,
    objectFit: 'contain',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    marginTop: 5,
    marginBottom: 15,
  },
  footerLeft: {
    width: '40%',
  },
  footerRight: {
    width: '50%',
    border: '1pt solid #808080',
  },
  logo: {
    width: 150,
    marginBottom: 10,
  },
  companyInfo: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  signRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #808080',
    minHeight: 40,
    alignItems: 'center',
  },
  signLabel: {
    width: '25%',
    backgroundColor: '#808080',
    color: 'white',
    padding: 20,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signContent: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imagesContainer: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
  },
  imageWrapper: {
    width: '50%',
    padding: 5,
    height: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  imageCaption: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 10,
    backgroundColor: '#808080',
    color: 'white',
    padding: 5,
    marginBottom: 5,
    fontFamily: 'Pretendard',
    fontWeight: 'bold', 
  },
  lastRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #808080',
    minHeight: 60,
  },
  websiteInfo: {
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
    marginBottom: 10,
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
            <Text style={[styles.headerValue, { width: '30%' }]}>{inspection.buildingName}</Text>
            <Text style={styles.headerCell}>점검일자</Text>
            <Text style={[styles.headerValue, { width: '30%' }]}>{formatDate(inspection.inspectionDate)}</Text>
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>주소</Text>
            <Text style={[styles.headerValue, { width: '80%' }]}>{inspection.address}</Text>
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>점검업체명</Text>
            <Text style={[styles.headerValue, { width: '30%' }]}>{inspection.companyName}</Text>
            <Text style={styles.headerCell}>건물등급</Text>
            <Text style={[styles.headerValue, { width: '30%' }]}>
              {inspection.buildingGrade ? `${inspection.buildingGrade}등급` : ''}
            </Text>
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
            <View style={styles.lastRow}>
              <Text style={styles.inspectionLabel}>기타</Text>
              <View style={styles.inspectionValue}>
                <Text style={styles.valueText}>
                  {inspection.etcComment?.match(/.{1,40}/g)?.join('\n') || ''}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 푸터 */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Image 
              src={process.env.PUBLIC_URL + '/images/sobang.png'} 
              style={styles.logo} 
            />
            <Text style={styles.companyInfo}>(주) 강동소방</Text>
            <Text style={styles.companyInfo}>대전 서구 대덕대로 141 (갈마동) 2층, 201호(수정빌딩)</Text>
            <Text style={styles.companyInfo}>Tel: 0507-1343-1190  Fax: 0507-1343-1190</Text>
          </View>
          <View style={styles.footerRight}>
            <View style={styles.signRow}>
              <Text style={styles.signLabel}>관계자</Text>
              <View style={styles.signContent}>
                <Text>성 명 :</Text>
                <View style={styles.signatureBox}>
                  {inspection.managerSignature && (
                    <Image 
                      src={inspection.managerSignature} 
                      style={{ width: '100%', height: '100%' }} 
                    />
                  )}
                </View>
              </View>
            </View>
            <View style={styles.signRow}>
              <Text style={styles.signLabel}>점검{'\n'}담당자</Text>
              <View style={styles.signContent}>
                <Text>담 당 자 : {inspection.inspectorName}</Text>
                <View style={styles.signatureBox}>
                  {inspection.inspectorSignature && (
                    <Image 
                      src={inspection.inspectorSignature} 
                      style={{ width: '100%', height: '100%' }} 
                    />
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 문의 웹사이트 정보 */}
        <Text style={styles.websiteInfo}>
          문의 www.oasyss.co.kr
        </Text>

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