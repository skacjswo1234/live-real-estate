# Cloudflare 계정 전환 가이드

## 문제 상황
- 원하는 계정: `Reallestatelive@gmail.com` (여기에 D1 DB가 있어야 함)
- 현재 로그인된 계정: `namhyunwoo0242@gmail.com` (여기에 R2 버킷이 생성됨)

## 해결 방법

### 방법 1: 올바른 계정으로 로그인 (권장)

1. **현재 계정 로그아웃**
```bash
wrangler logout
```

2. **올바른 계정으로 로그인**
```bash
wrangler login
```
브라우저가 열리면 `Reallestatelive@gmail.com` 계정으로 로그인하세요.

3. **계정 확인**
```bash
wrangler whoami
```
`Reallestatelive@gmail.com`이 표시되는지 확인하세요.

4. **Account ID 확인**
- Cloudflare Dashboard 접속: https://dash.cloudflare.com
- `Reallestatelive@gmail.com` 계정으로 로그인
- 우측 상단에서 계정 선택
- Overview 페이지에서 **Account ID** 복사

5. **wrangler.toml에 Account ID 추가**
```toml
name = "live-real-estate"
compatibility_date = "2024-01-01"
main = "worker.js"
account_id = "YOUR_ACCOUNT_ID"  # 여기에 복사한 Account ID 붙여넣기
```

6. **D1 스키마 적용**
```bash
wrangler d1 execute live-real-estate-db --remote --file=schema.sql
```

7. **R2 버킷 생성**
```bash
wrangler r2 bucket create live-real-estate-images
```

### 방법 2: Account ID를 명시적으로 지정

`wrangler.toml` 파일에 `account_id`를 추가하면 특정 계정을 강제로 사용할 수 있습니다.

1. **Account ID 확인**
   - Cloudflare Dashboard 접속
   - `Reallestatelive@gmail.com` 계정으로 로그인
   - 우측 상단 계정 선택 → Overview → Account ID 복사

2. **wrangler.toml 수정**
```toml
account_id = "복사한_Account_ID"
```

3. **올바른 계정으로 로그인**
```bash
wrangler logout
wrangler login
# Reallestatelive@gmail.com으로 로그인
```

## 확인 방법

### D1 데이터베이스 확인
```bash
wrangler d1 list
```
`live-real-estate-db`가 `Reallestatelive@gmail.com` 계정에 있는지 확인

### R2 버킷 확인
```bash
wrangler r2 bucket list
```
`live-real-estate-images`가 올바른 계정에 있는지 확인

## 주의사항

- D1 데이터베이스는 계정별로 독립적입니다
- R2 버킷도 계정별로 독립적입니다
- `database_id`가 올바른 계정의 것인지 확인하세요
- Worker 배포 시에도 같은 계정을 사용해야 합니다

