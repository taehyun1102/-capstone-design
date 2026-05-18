# 프론트엔드 연동 스펙 (분석 정리)

> 대상: `-capstone-design/frontend` (Next.js App Router)  
> 작성 기준: 프론트엔드 코드 정적 분석 (실제 HTTP API 호출 없음)  
> 목적: 백엔드 API 설계·구현 시 참고 문서

---

## 목차

1. [현재 아키텍처 요약](#1-현재-아키텍처-요약)
2. [입력 데이터](#2-입력-데이터)
3. [API 연동이 필요한 지점](#3-api-연동이-필요한-지점)
4. [백엔드 응답 JSON 형식](#4-백엔드-응답-json-형식)
5. [AI 프롬프트 스키마와의 관계](#5-ai-프롬프트-스키마와의-관계)
6. [일기 기능 (로컬 전용)](#6-일기-기능-로컬-전용)
7. [권장 API 엔드포인트 초안](#7-권장-api-엔드포인트-초안)

---

## 1. 현재 아키텍처 요약

| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js (App Router) |
| 라우팅 | `/` → `/input` 리다이렉트 |
| 주요 페이지 | `/input`, `/result`, `/diary`, `/diary/write`, `/diary/list` |
| HTTP 클라이언트 | **없음** (`fetch`, `axios` 미사용) |
| 분석 데이터 전달 | `sessionStorage` 키 `analysisPayload` |
| 일기 데이터 | `localStorage` 키 `myDiary` |
| 스크린샷 분석 | `setTimeout` + 랜덤 신뢰도(82~93%) 목업 |
| 최종 제출 | `sessionStorage` 저장 후 1초 뒤 `/result` 이동 |

### 페이지별 역할

| 경로 | 파일 | 역할 |
|------|------|------|
| `/` | `app/page.tsx` | `/input`으로 리다이렉트 |
| `/input` | `app/input/page.tsx` | 설문 + 스크린샷 입력, payload 생성 |
| `/result` | `app/result/page.tsx` | `sessionStorage`에서 결과 표시 |
| `/diary` | `app/diary/page.tsx` | 일기 메뉴 (링크만) |
| `/diary/write` | `app/diary/write/page.tsx` | 일기 작성 → localStorage |
| `/diary/list` | `app/diary/list/page.tsx` | 일기 목록 조회 |

### 데이터 흐름 (현재)

```
/input  --[buildPayload]-->  sessionStorage("analysisPayload")  -->  /result
         --[스크린샷 분석]-->  프론트 목업 (API 없음)

/diary/write  -->  localStorage("myDiary")  -->  /diary/list
```

### 데이터 흐름 (백엔드 연동 후 목표)

```
/input  --[POST /analyze/screenshot]-->  스크린샷 분석 결과
/input  --[POST /analyze]------------->  최종 분석 + aiDetectedPatterns
         --[merge & sessionStorage]-->  /result
```

---

## 2. 입력 데이터

### 2.1 하루 분석 — `UserInputData`

프론트 타입 정의: `app/input/page.tsx` (`UserInputData`)

| 필드 | 타입 | 필수 | 허용 값 / 제약 |
|------|------|:----:|----------------|
| `mainActivity` | string | O | `공부`, `유튜브/영상 시청`, `게임`, `SNS/채팅`, `휴식/기타` |
| `dayMood` | string | O | `생산적이었음`, `평소와 비슷했음`, `조금 흐트러졌음`, `피곤했음` |
| `faceToFaceInteraction` | string | O | `거의 없었음`, `조금 있었음`, `보통이었음`, `많았음`, `매우 많았음` |
| `focusTime` | string | O | `오전`, `오후`, `저녁`, `밤`, `잘 모르겠음` |
| `fatigueLevel` | string | O | `매우 낮음`, `낮음`, `보통`, `높음`, `매우 높음` |
| `frequentCheck` | string | O | `메시지 확인`, `SNS 확인`, `영상 확인`, `뉴스 확인`, `특별히 없음` |
| `impulseActivity` | string | O | `영상 시청`, `게임`, `SNS`, `채팅`, `기타` |
| `distractionFactor` | string | O | `알림`, `SNS`, `피로`, `주변 환경`, `없음` |
| `hadGoal` | string | O | `네`, `아니요` |
| `achievedGoal` | string | 조건부 | `hadGoal === "네"` 일 때만 필수: `네`, `아니요` |
| `memo` | string | O | 1~120자 (`MEMO_MAX_LENGTH`), trim 후 비어 있으면 불가 |

### 2.2 스크린샷 입력

| 항목 | 값 |
|------|-----|
| 허용 MIME | `image/png`, `image/jpeg`, `image/jpg` |
| 최대 크기 | 10MB (`MAX_FILE_SIZE`) |
| 필수 정책 | (1) 업로드 후 **분석 완료**, 또는 (2) **「스크린샷 없이 분석」** 선택 |

업로드 시 프론트는 파일 본문을 서버로 보내지 않으며, 미리보기용 `blob:` URL만 사용합니다.

### 2.3 제출 payload — `AnalysisPayload`

`buildPayload()`가 생성하는 구조 (`app/input/page.tsx`):

```json
{
  "analyzedAt": "2026-05-18T12:00:00.000Z",
  "userInput": {
    "mainActivity": "공부",
    "dayMood": "생산적이었음",
    "focusTime": "오전",
    "fatigueLevel": "보통",
    "frequentCheck": "SNS 확인",
    "impulseActivity": "SNS",
    "distractionFactor": "알림",
    "hadGoal": "네",
    "achievedGoal": "아니요",
    "faceToFaceInteraction": "보통이었음",
    "memo": "오늘은 집중이 잘 됐다."
  },
  "screenshotInfo": {
    "uploaded": true,
    "fileName": "screenshot.png",
    "analyzed": true,
    "skipped": false,
    "estimatedConfidence": 87
  }
}
```

#### `screenshotInfo` 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `uploaded` | boolean | 스크린샷 미리보기 존재 여부 |
| `fileName` | string | 원본 파일명 (없으면 `""`) |
| `analyzed` | boolean | 스크린샷 분석 버튼 완료 여부 |
| `skipped` | boolean | 「스크린샷 없이 분석」 선택 시 `true` |
| `estimatedConfidence` | number | 분석 신뢰도 0~100 (현재 프론트 목업) |

---

## 3. API 연동이 필요한 지점

현재 **실제 API 호출은 없습니다.** 아래 위치에 백엔드를 연결해야 UI가 의도대로 동작합니다.

### 3.1 스크린샷 분석

| 항목 | 내용 |
|------|------|
| 파일 | `app/input/page.tsx` |
| 함수 | `handleScreenshotAnalyze()` |
| 현재 | 1.8초 `setTimeout` 후 `estimatedConfidence` 82~93 랜덤 |
| 필요 API | 이미지 업로드 → 사용 패턴/OCR 분석 → 신뢰도·요약 반환 |

### 3.2 최종 분석 제출

| 항목 | 내용 |
|------|------|
| 파일 | `app/input/page.tsx` |
| 함수 | `handleSubmit()` |
| 현재 | `sessionStorage.setItem("analysisPayload", ...)` 후 `/result` 이동 |
| 필요 API | `AnalysisPayload`(+ 이미지) 수신 → AI 분석 → `aiDetectedPatterns` 등 포함 응답 |

### 3.3 결과 표시

| 항목 | 내용 |
|------|------|
| 파일 | `app/result/page.tsx` |
| 현재 | `sessionStorage.getItem("analysisPayload")`만 파싱 |
| 필요 데이터 | 응답에 **`aiDetectedPatterns`** 배열 포함 (현재 input이 넣지 않아 UI 비어 있음) |

### 3.4 UI에 아직 연결되지 않은 영역

`/result`의 다음 영역은 **하드코딩**되어 있어, 백엔드 필드를 쓰려면 추후 프론트 수정이 필요합니다.

- 「AI 종합 해석」 문단
- 「행동 추천 보기」 토글 내 3개 추천 카드

### 3.5 일기 (선택)

| 항목 | 내용 |
|------|------|
| 파일 | `app/diary/write/page.tsx`, `app/diary/list/page.tsx` |
| 현재 | `localStorage` 키 `myDiary` |
| 서버 저장 시 | CRUD API 별도 설계 필요 (프론트 미연동) |

---

## 4. 백엔드 응답 JSON 형식

### 4.1 결과 페이지가 소비하는 필드

`app/result/page.tsx` 참조:

```typescript
// 실제 사용 필드
data.userInput          // 요약 3줄: mainActivity, dayMood, focusTime
data.aiDetectedPatterns // 패턴 그래프 + 카드 (없으면 빈 배열)
```

#### `aiDetectedPatterns[]` 항목 스키마

| 필드 | 타입 | 필수 | UI 용도 |
|------|------|:----:|---------|
| `id` | string \| number | O | React `key` |
| `title` | string | O | 그래프·카드 제목 |
| `confidence` | number | O | 0~100, 진행 막대 `width` (%) |
| `category` | string | O | 카드 상단 라벨 (예: `집중 패턴`) |
| `detail` | string | O | 카드 설명 본문 |

### 4.2 권장 최종 분석 응답 예시

`POST /analyze` (또는 동등 엔드포인트) 응답 본문 예시:

```json
{
  "analyzedAt": "2026-05-18T12:00:00.000Z",
  "userInput": {
    "mainActivity": "공부",
    "dayMood": "생산적이었음",
    "focusTime": "오전",
    "fatigueLevel": "보통",
    "frequentCheck": "SNS 확인",
    "impulseActivity": "SNS",
    "distractionFactor": "알림",
    "hadGoal": "네",
    "achievedGoal": "아니요",
    "faceToFaceInteraction": "보통이었음",
    "memo": "오늘은 집중이 잘 됐다."
  },
  "screenshotInfo": {
    "uploaded": true,
    "fileName": "screenshot.png",
    "analyzed": true,
    "skipped": false,
    "estimatedConfidence": 87
  },
  "aiDetectedPatterns": [
    {
      "id": "focus-dip-evening",
      "title": "저녁 시간대 집중 저하",
      "confidence": 78,
      "category": "집중 패턴",
      "detail": "오후 이후 사용 시간이 늘어나는 경향이 관찰됩니다."
    },
    {
      "id": "sns-impulse",
      "title": "SNS 즉각 반응 패턴",
      "confidence": 65,
      "category": "디지털 사용",
      "detail": "짧은 간격의 확인 행동이 반복된 것으로 보입니다."
    }
  ]
}
```

> **연동 시 유의:** 프론트는 현재 응답을 API로 받지 않고 `sessionStorage`만 읽습니다. 백엔드 응답을 그대로 저장하거나, `userInput` + `aiDetectedPatterns`를 merge한 객체를 `analysisPayload`로 넣어야 `/result` 패턴 UI가 채워집니다.

### 4.3 스크린샷 분석 API 응답 예시

`POST /analyze/screenshot` (`multipart/form-data`, 필드명 예: `image`) 권장 응답:

```json
{
  "analyzed": true,
  "estimatedConfidence": 87,
  "summaryCards": [
    "주요 사용 앱 흐름 분석",
    "시간대별 사용 패턴 참고",
    "앱 사용 비중 패턴 참고"
  ],
  "extractedUsage": {
    "topApps": ["YouTube", "KakaoTalk"],
    "peakUsagePeriod": "저녁"
  }
}
```

| 필드 | 프론트 사용 여부 |
|------|------------------|
| `estimatedConfidence` | 사용 (`screenshotInfo.estimatedConfidence` 대체 가능) |
| `analyzed` | 사용 (`screenshotInfo.analyzed`) |
| `summaryCards` | 미사용 (UI 문구 하드코딩) |
| `extractedUsage` | 미사용 (최종 분석 입력으로 활용 권장) |

### 4.4 최종 분석 요청 본문 예시

JSON만 보낼 경우 (`screenshotInfo.skipped === true`):

```json
{
  "analyzedAt": "2026-05-18T12:00:00.000Z",
  "userInput": { "...": "..." },
  "screenshotInfo": {
    "uploaded": false,
    "fileName": "",
    "analyzed": false,
    "skipped": true,
    "estimatedConfidence": 0
  }
}
```

이미지 포함 시: `multipart/form-data`로 `payload`(JSON 문자열) + `screenshot`(파일) 조합을 권장합니다.

---

## 5. AI 프롬프트 스키마와의 관계

레포 `AI/prompts.js`는 LLM용 **별도 JSON 스키마**를 정의합니다. 프론트 `result` 페이지와 **직접 연결되어 있지 않습니다.**

### 5.1 LLM 출력 형식 (`SYSTEM_PROMPT`)

```json
{
  "summary": "오늘 하루의 핵심 데이터 요약 (1문장)",
  "pattern": "진화심리학 관점의 심층적 행동 해석 (2~3문장)",
  "advice": "내일의 인지 자원 방어를 위한 전략적 행동 지침 (1문장)"
}
```

### 5.2 `buildUserPrompt(data)` 기대 필드

| prompts.js 필드 | 프론트 `UserInputData` 대응 (매핑 필요) |
|-----------------|----------------------------------------|
| `activity` | `mainActivity` |
| `mood` | `dayMood` |
| `socialInteraction` | `faceToFaceInteraction` |
| `focusedTime` | `focusTime` |
| `fatigue` | `fatigueLevel` |
| `frequentActivity` | `frequentCheck` |
| `temptingActivity` | `impulseActivity` |
| `distraction` | `distractionFactor` |
| `hasGoal` | `hadGoal === "네"` (boolean 변환) |
| `goalResult` | `achievedGoal` |
| `memo` | `memo` |
| `hasScreenshot` | `screenshotInfo.uploaded && !screenshotInfo.skipped` |

### 5.3 백엔드 변환 전략 (권장)

1. **요청 수신:** 프론트 `AnalysisPayload` 그대로 파싱  
2. **LLM 호출:** `UserInputData` → `buildUserPrompt` 필드로 매핑  
3. **응답 변환:** LLM `{ summary, pattern, advice }` →  
   - `aiDetectedPatterns` (패턴 카드용, confidence는 규칙/모델 보조 점수)  
   - (선택) `summary` / `pattern` / `advice`를 result UI 확장용 필드로 추가  

---

## 6. 일기 기능 (로컬 전용)

서버 API 없음. 브라우저 `localStorage` 키: **`myDiary`**

### 저장 형식

```json
[
  {
    "id": 1716000000000,
    "date": "2026. 5. 18.",
    "content": "일기 본문"
  }
]
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | number | `Date.now()` 타임스탬프 |
| `date` | string | `toLocaleDateString()` (로케일 의존) |
| `content` | string | 사용자 입력 본문 |

서버 연동 시 제안 스키마: `id`, `date` (ISO 8601 권장), `content`, `createdAt`, `updatedAt`.

---

## 7. 권장 API 엔드포인트 초안

| 메서드 | 경로 | 설명 | 요청 | 응답 핵심 |
|--------|------|------|------|-----------|
| `POST` | `/api/analyze/screenshot` | 스크린샷 OCR/패턴 추출 | `multipart` 이미지 | `estimatedConfidence`, `extractedUsage` |
| `POST` | `/api/analyze` | 최종 하루 분석 | `AnalysisPayload` (+ 선택 이미지) | `aiDetectedPatterns`, echo `userInput` |
| `GET` | `/api/diaries` | 일기 목록 (선택) | — | `DiaryEntry[]` |
| `POST` | `/api/diaries` | 일기 저장 (선택) | `{ content }` | `DiaryEntry` |

### 검증 규칙 (프론트와 동일하게 맞출 것)

- 필수 select 8개 + `hadGoal` + `faceToFaceInteraction` + `memo` (1자 이상, 120자 이하)
- `hadGoal === "네"` → `achievedGoal` 필수
- 스크린샷 업로드 시 → 분석 완료(`analyzed: true`) 또는 `skipped: true`

---

## 부록: 프론트 검증 로직 참조

- 구현 파일: `frontend/app/input/page.tsx`
- 함수: `validateBeforeSubmit()`
- 제출 함수: `handleSubmit()` → `sessionStorage` 키 `analysisPayload`
- 결과 읽기: `frontend/app/result/page.tsx` → `data?.aiDetectedPatterns`, `data?.userInput`

---

*이 문서는 프론트엔드 코드 분석 결과이며, 백엔드 구현 시 프론트 수정 없이는 API만 추가해도 UI에 반영되지 않습니다. 연동 시 프론트의 `handleSubmit`, `handleScreenshotAnalyze`, `result/page.tsx` 수정이 필요합니다.*
