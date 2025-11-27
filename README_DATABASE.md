# 상가 매물 데이터베이스 설정 가이드

## Cloudflare D1 데이터베이스 설정

### 1. D1 데이터베이스 생성

```bash
# Cloudflare Wrangler CLI 설치 (이미 설치되어 있다면 생략)
npm install -g wrangler

# 로그인
wrangler login

# D1 데이터베이스 생성
wrangler d1 create live-real-estate-db
```

생성 후 출력되는 `database_id`를 복사해두세요.

### 2. wrangler.toml 설정

프로젝트 루트에 `wrangler.toml` 파일이 생성되어 있으며, 다음 정보로 설정되어 있습니다:

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

**설정 정보:**
- Database ID: `139ac0f9-fc33-4c94-b513-b2c849020ed7`
- Database Name: `live-real-estate-db`
- Variable Name: `live-real-estate-db`

### 3. 스키마 적용

```bash
# 로컬 개발 환경
wrangler d1 execute live-real-estate-db --local --file=schema.sql

# 프로덕션 환경
wrangler d1 execute live-real-estate-db --file=schema.sql
```

**현재 데이터베이스 정보:**
- Database Name: `live-real-estate-db`
- Database ID: `139ac0f9-fc33-4c94-b513-b2c849020ed7`

### 4. R2 버킷 생성 (이미지 저장용)

```bash
# R2 버킷 생성
wrangler r2 bucket create live-real-estate-images
```

## 데이터베이스 필드 설명

### 필수 필드
- `name`: 매물명
- `region`: 지역 (예: '연산동')
- `address`: 주소
- `transaction_type`: 거래형태 ('임대' 또는 '매매')
- `lat`, `lng`: 위도, 경도

### 선택 필드
- `price`, `price_value`: 가격 정보
- `lease_condition`: 임대조건 (임대인 경우)
- `exclusive_area`, `supply_area`: 전용/공급 면적
- `key_money`: 권리금
- `maintenance_fee`: 관리비
- `parking`: 주차 정보
- `elevator`: 엘리베이터 유무
- `room_count`: 방갯수
- `bathroom_count`: 화장실 갯수
- `purpose`: 용도
- `total_floors`, `floor_number`: 총층수 및 해당층
- `building_direction`: 건축물 방향
- `approval_date`: 사용승인일
- `move_in_date`: 입주가능일
- `images`: 이미지 URL 배열 (JSON 형식)

## API 사용 예시

### 매물 등록
```javascript
const propertyData = {
    name: '연산동 상가',
    region: '연산동',
    address: '부산광역시 연제구 연산동',
    transaction_type: '매매',
    price: '12억원',
    price_value: 12,
    exclusive_area: 120,
    supply_area: 150,
    area: '120㎡',
    area_value: 120,
    lat: 35.1820,
    lng: 129.0850,
    key_money: '문의',
    maintenance_fee: 50000,
    parking: '2대',
    elevator: '유',
    room_count: 3,
    bathroom_count: 2,
    purpose: '상가',
    total_floors: 3,
    floor_number: 2,
    building_direction: '북동향',
    type: '상가',
    images: ['https://example.com/image1.jpg']
};

await createProperty(env, propertyData);
```

### 매물 조회
```javascript
// 모든 매물
const allProperties = await getAllProperties(env);

// 지역별 매물
const regionProperties = await getPropertiesByRegion(env, '연산동');

// 필터 검색
const filtered = await searchProperties(env, {
    transactionType: '매매',
    minPrice: 5,
    maxPrice: 20,
    region: '연산동'
});
```

## 이미지 업로드 (R2)

이미지는 Cloudflare R2에 저장하고 URL을 데이터베이스에 저장합니다.

```javascript
// 이미지 업로드 예시 (Cloudflare Worker에서)
async function uploadImage(env, file) {
    const objectKey = `properties/${Date.now()}-${file.name}`;
    await env.IMAGES.put(objectKey, file);
    return `https://your-r2-domain.com/${objectKey}`;
}
```

