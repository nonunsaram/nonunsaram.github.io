# 노는사람 한국어화 아카이브

https://nonunsaram.github.io/ 에 게시되는 소닉 시리즈 비공식 한국어 패치·매뉴얼 아카이브입니다. 빌드 과정 없는 정적 사이트이며, 내용은 모두 `data/` 폴더의 JSON에서 읽어 옵니다.

## 프로젝트 추가·수정

`data/projects.json`의 `projects` 배열에 항목을 하나 추가하면 됩니다. 순서는 상관없고, 화면에는 `updated`가 최신인 순서로 표시됩니다.

```json
{
  "id": "sonic-colors-korean",
  "title": "소닉 컬러즈",
  "originalTitle": "Sonic Colors",
  "platform": "wii",
  "base": "북미판 Wii",
  "version": "v1.0",
  "status": "released",
  "updated": "2026-11-01",
  "summary": "한 줄 소개",
  "highlights": ["특징 1", "특징 2"],
  "links": {
    "download": "https://github.com/nonunsaram/…/releases/tag/v1.0",
    "guide": "https://github.com/nonunsaram/…#readme",
    "repo": "https://github.com/nonunsaram/…"
  },
  "related": ["다른-프로젝트-id"]
}
```

| 필드 | 설명 |
| --- | --- |
| `id` | 저장소 이름 권장. 카드 주소(`#id`)로도 쓰입니다. |
| `platform` | `data/platforms.json`의 키 (`gamecube`, `wii`, `ps2`, `pc`, `megadrive`). 새 기종은 그 파일에 이름과 색을 추가합니다. |
| `status` | `released`(배포 중), `beta`, `alpha`, `wip`(작업 중) |
| `links` | 모두 선택 항목입니다. `download`, `guide`, `site`(소개·매뉴얼 사이트), `issues`, `repo` |
| `related` | 함께 보여 줄 다른 프로젝트의 `id` 목록 (선택) |

## 매뉴얼 추가

매뉴얼은 각 프로젝트 사이트의 `data/catalog.json`을 그대로 읽어 표지 목록을 만듭니다. 새 매뉴얼 묶음은 `data/manuals.json`의 `collections`에 사이트 주소(`base`), 카탈로그 경로(`catalog`), 뷰어 파일(`viewer`)을 추가하면 됩니다. 카탈로그 형식은 `sonic-mega-collection-plus-ps2-korean`의 `FRONTEND_HANDOFF.md`를 따릅니다.

## 채널·문구

유튜브·X 주소와 사이트 문구는 `data/site.json`에 있습니다. `url`이 비어 있는 채널은 "링크 준비 중"으로 표시됩니다.

## 로컬 확인

```text
python -m http.server 8000
```

`http://localhost:8000/`을 엽니다. JSON을 읽기 때문에 HTML 파일을 직접 열면 동작하지 않습니다.

## 디자인

세가코리아 공식 사이트 느낌의 파란 계열(`--sega`)과 노란 포인트(`--ring`)를 씁니다. 글꼴은 SEGA 아시아 공식 사이트와 같은 [Noto Sans KR](https://fonts.google.com/noto/specimen/Noto+Sans+KR)(SIL Open Font License 1.1)을 Google Fonts에서 불러옵니다. 디자인 토큰은 각 프로젝트 사이트와 같게 유지합니다.

## 권리 안내

비공식 팬 번역 프로젝트입니다. Sonic 및 관련 게임, 로고, 원본 매뉴얼의 권리는 SEGA 및 각 권리자에게 있으며, 이 사이트는 SEGA와 관련이 없습니다. 게임 ISO·ROM은 배포하지 않습니다.
