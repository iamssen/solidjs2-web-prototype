# 개요

이 프로젝트는 개발이 진행중인 Solid.js 2.0을 사용해서 Web App을 구현해보는 프로토타입 프로젝트입니다.

## 디렉토리

- `apps/`: Web App들 입니다.
  - 여러개의 Web App들을 만들기 위해 `apps/{app_name}/`과 같이 여러개의 디렉토리를 만듭니다.
  - `apps/{app_name}/vite.config.mts` 파일이 해당 Web App의 Vite 설정 파일입니다.
- `apps/app/runtime-checks/`: `eslint-plugin-solid` 개발에 필요한 Solid.js 2.0의 실제 브라우저 런타임 동작을 확인하는 코드입니다.
  - 각 확인 코드와 Playwright E2E test는 같은 디렉토리에 둡니다. 현재 디렉토리 전체를 검증하는 test 파일은 `index.spec.ts`입니다.
  - `npm run test:e2e`로 Chromium에서 실행합니다.
  - 이 코드는 ESLint의 valid fixture가 아닙니다. 현재 개발 중인 `@ssen/eslint-plugin-solid`의 경고를 없애기 위해 런타임 확인 코드를 바꾸지 마십시오.
- `docs/`: 기술문서들을 모아둡니다.

## Solid.js 2.0

이 프로젝트는 개발이 진행중인 Solid.js 2.0를 사용하기 때문에 웹검색 결과에서 얻은 내용은 틀릴 수 있습니다.
기술적 사항들을 결정할때는 `docs/` 디렉토리의 내용들을 우선적으로 확인해야 합니다.

## ESLint

Solid.js 코드의 Linting은 `@ssen/eslint-plugin-solid`를 사용하고 있습니다.
이 라이브러리는 현재 동시에 개발중이기 때문에 현재 프로젝트의 코드가 맞고, Lint 결과가 틀릴 수 있습니다.
이 부분을 염두해두고 `@ssen/eslint-plugin-solid`에 의해 발생되는 Lint 경고를 수정하기 위해 코드 수정을 시도하지 마십시오.

## `docs/` 디렉토리

- `Solid.md`: `docs/`내의 다른 문서들을 검토해서 Solid 2.0를 학습하는데 필요한 필수적인 내용들만 짧게 요약한 문서입니다. (Cheatsheet 용도) AI에 의해 작성됩니다.
- 그 외의 문서들은 명시적으로 요청하지 않는 이상 수정을 하지 마십시오.
