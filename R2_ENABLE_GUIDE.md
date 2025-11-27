# R2 활성화 가이드

## 에러 원인
```
X [ERROR] A request to the Cloudflare API (/accounts/.../r2/buckets) failed.
Please enable R2 through the Cloudflare Dashboard. [code: 10042]
```

이 에러는 **R2가 Cloudflare Dashboard에서 활성화되지 않았기 때문**입니다.

## 해결 방법

### 1. Cloudflare Dashboard에서 R2 활성화

1. **Cloudflare Dashboard 접속**
   - https://dash.cloudflare.com
   - `Reallestatelive@gmail.com` 계정으로 로그인

2. **R2 메뉴로 이동**
   - 왼쪽 사이드바에서 **"R2"** 클릭
   - 또는 직접 URL: https://dash.cloudflare.com/[account_id]/r2

3. **R2 활성화**
   - R2 페이지에 들어가면 "Get started" 또는 "Enable R2" 버튼이 표시됩니다
   - 버튼을 클릭하여 R2를 활성화하세요
   - 결제 정보 입력이 필요할 수 있습니다 (무료 플랜도 사용 가능)

4. **활성화 확인**
   - R2 페이지에서 "Create bucket" 버튼이 보이면 활성화 완료입니다

### 2. wrangler.toml 확인

`wrangler.toml` 파일에 `account_id`가 올바르게 설정되어 있는지 확인:

```toml
account_id = "2d03537ab2383e9b707c73190c817901"
```

### 3. R2 버킷 생성 재시도

R2 활성화 후 다시 시도:

```bash
wrangler r2 bucket create live-real-estate-images
```

## R2 무료 플랜

- **무료 제공량**: 
  - 저장: 10GB
  - Class A 작업: 1백만 건/월
  - Class B 작업: 1천만 건/월
  - 데이터 전송: 10GB/월

- **초과 시**: 사용한 만큼만 과금 (Pay-as-you-go)

## 참고

- R2는 S3 호환 API를 제공합니다
- 이미지는 R2에 저장하고, URL을 데이터베이스에 저장합니다
- Public URL을 사용하거나, Worker를 통해 이미지를 서빙할 수 있습니다

