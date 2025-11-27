# 관리자 페이지 사용 가이드

## 파일 구조

```
live-real-estate/
├── admin.html          # 관리자 페이지 (매물 등록/관리)
├── map.html            # 사용자 페이지 (매물 지도)
├── worker.js           # Cloudflare Worker (API)
├── database.js         # 데이터베이스 헬퍼 함수
├── schema.sql          # 데이터베이스 스키마
└── wrangler.toml       # Cloudflare 설정
```

## 관리자 페이지 기능

### 1. 매물 등록
- 기본 정보: 매물명, 지역, 거래형태
- 가격 정보: 가격, 권리금, 관리비
- 면적 정보: 전용면적, 공급면적
- 위치 정보: 주소, 위도/경도 (지도 클릭으로 설정 가능)
- 상세 정보: 주차, 엘리베이터, 방갯수, 화장실, 용도, 층수, 방향, 날짜
- 이미지 업로드: 여러 이미지 업로드 가능

### 2. 매물 목록
- 등록된 모든 매물 조회
- 매물 수정/삭제 기능

## 설정 방법

### 1. Cloudflare Worker 배포

```bash
# wrangler.toml 파일 생성
wrangler init

# Worker 배포
wrangler deploy
```

### 2. wrangler.toml 설정

`wrangler.toml` 파일이 이미 생성되어 있으며, 다음 정보로 설정되어 있습니다:

```toml
name = "live-real-estate"
compatibility_date = "2024-01-01"
main = "worker.js"

[[d1_databases]]
binding = "DB"
database_name = "live-real-estate-db"
database_id = "139ac0f9-fc33-4c94-b513-b2c849020ed7"

[[r2_buckets]]
binding = "IMAGES"
bucket_name = "live-real-estate-images"
```

**현재 설정:**
- Database ID: `139ac0f9-fc33-4c94-b513-b2c849020ed7`
- Database Name: `live-real-estate-db`
- Variable Name: `live-real-estate-db`

### 3. admin.html에서 API URL 설정

`admin.html` 파일의 JavaScript 부분에서:

```javascript
// 실제 Cloudflare Worker URL로 변경
const API_BASE_URL = 'https://your-worker.your-subdomain.workers.dev/api';
```

### 4. R2 Custom Domain 설정 (선택사항)

이미지 URL을 사용하기 위해 R2에 Custom Domain을 설정하거나, Worker를 통해 이미지를 서빙할 수 있습니다.

## 사용 방법

### 매물 등록
1. 관리자 페이지 접속 (`admin.html`)
2. "매물 등록" 탭 선택
3. 필수 항목 입력:
   - 매물명
   - 지역
   - 거래형태
   - 주소
   - 위도/경도 (지도에서 클릭하거나 직접 입력)
4. 선택 항목 입력
5. 이미지 업로드 (선택사항)
6. "매물 등록" 버튼 클릭

### 매물 수정
1. "매물 목록" 탭 선택
2. 수정할 매물의 "수정" 버튼 클릭
3. 정보 수정 후 "매물 등록" 버튼 클릭 (같은 버튼 사용)

### 매물 삭제
1. "매물 목록" 탭 선택
2. 삭제할 매물의 "삭제" 버튼 클릭
3. 확인 대화상자에서 확인

## 지도 기능

- **주소 검색**: 카카오 주소 API 연동 필요
- **현재 위치**: 브라우저 위치 권한 필요
- **지도 클릭**: 지도를 클릭하면 해당 위치의 위도/경도가 자동 입력됨

## 이미지 업로드

- 여러 이미지 선택 가능
- 선택한 이미지는 미리보기로 표시
- 업로드된 이미지는 Cloudflare R2에 저장됨
- 이미지 URL이 데이터베이스에 저장됨

## 주의사항

1. **API URL**: 실제 배포 시 `admin.html`의 `API_BASE_URL`을 Cloudflare Worker URL로 변경해야 합니다.

2. **카카오 주소 API**: 주소 검색 기능을 사용하려면 카카오 주소 API 키가 필요합니다.

3. **R2 이미지 URL**: R2에 업로드된 이미지의 Public URL을 사용하거나, Worker를 통해 이미지를 서빙해야 합니다.

4. **CORS**: 개발 환경에서는 CORS 문제가 발생할 수 있으므로, 실제 배포 시 적절한 CORS 설정이 필요합니다.

