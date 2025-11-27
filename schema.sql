-- 상가 매물 테이블 스키마 (Cloudflare D1)
-- 실행: wrangler d1 execute DB_NAME --file=schema.sql

CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- 기본 정보
    name TEXT NOT NULL,                    -- 매물명 (예: '연산동 상가')
    region TEXT NOT NULL,                  -- 지역 (예: '연산동')
    address TEXT NOT NULL,                 -- 주소 (예: '부산광역시 연제구 연산동')
    
    -- 거래 정보
    transaction_type TEXT NOT NULL,         -- 거래형태: '임대' 또는 '매매'
    price TEXT,                             -- 가격 표시 문자열 (예: '12억원')
    price_value REAL,                      -- 가격 숫자값 (억원 단위, 예: 12.0)
    lease_condition TEXT,                   -- 임대조건 (임대인 경우)
    
    -- 면적 정보
    exclusive_area REAL,                    -- 전용면적 (㎡)
    supply_area REAL,                       -- 공급면적 (㎡)
    area TEXT,                              -- 면적 표시 문자열 (예: '120㎡')
    area_value REAL,                        -- 면적 숫자값 (㎡)
    
    -- 위치 정보
    lat REAL NOT NULL,                      -- 위도
    lng REAL NOT NULL,                      -- 경도
    
    -- 상세 정보
    key_money TEXT,                         -- 권리금 (예: '문의' 또는 '5000만원')
    maintenance_fee INTEGER,                -- 관리비 (원 단위)
    parking TEXT,                           -- 주차 (예: '유', '무', '2대')
    elevator TEXT,                          -- 엘리베이터 (예: '유', '무')
    room_count INTEGER,                     -- 방갯수
    bathroom_count INTEGER,                 -- 화장실 갯수
    purpose TEXT,                           -- 용도 (예: '상가', '음식점', '사무실')
    total_floors INTEGER,                   -- 총층수
    floor_number INTEGER,                   -- 해당층
    building_direction TEXT,                -- 건축물 방향 (예: '북동향')
    approval_date TEXT,                      -- 사용승인일 (YYYY-MM-DD 형식)
    move_in_date TEXT,                       -- 입주가능일 (YYYY-MM-DD 형식)
    
    -- 매물 타입 (기존 호환성)
    type TEXT DEFAULT '상가',               -- 매물 타입 (예: '상가', '원룸', '오피스텔')
    
    -- 이미지 정보
    images TEXT,                            -- 이미지 URL 배열 (JSON 형식으로 저장)
    
    -- 메타 정보
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1             -- 활성화 여부 (1: 활성, 0: 비활성)
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_region ON properties(region);
CREATE INDEX IF NOT EXISTS idx_transaction_type ON properties(transaction_type);
CREATE INDEX IF NOT EXISTS idx_price_value ON properties(price_value);
CREATE INDEX IF NOT EXISTS idx_area_value ON properties(area_value);
CREATE INDEX IF NOT EXISTS idx_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_is_active ON properties(is_active);
CREATE INDEX IF NOT EXISTS idx_location ON properties(lat, lng);

