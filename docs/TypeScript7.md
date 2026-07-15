# TypeScript 7.0 발표

> 원문: [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)  
> 게시일: 2026년 7월 8일  
> 이 문서는 원문의 한국어 번역입니다.

오늘, TypeScript의 네이티브 포트인 TypeScript 7을 발표하게 되어 기쁩니다. TypeScript 7은 최대 10배 더 빠릅니다.

초기부터 TypeScript는 규모가 커져도 잘 동작하는 JavaScript를 제공하겠다는 약속을 해 왔습니다. 강력한 타입 검사와 풍부한 도구를 JavaScript 세계에 제공해, 여러 플랫폼에서 작지 않은 규모의 고품질 앱을 만들 수 있게 했습니다.

작년에 TypeScript 팀은 규모 확장의 다음 단계를 공개했습니다. 도구 모음의 모든 부분을 한 자릿수 배수만큼 더 빠르게 만드는 일이었습니다. 목표는 최신 하드웨어를 최대한 활용할 수 있는 Go 기반 TypeScript 네이티브 포트였습니다. 두 컴파일러의 결과를 일관되고 호환되게 유지하기 위해, 원래 코드베이스의 구조와 논리를 유지하면서 새 코드를 작성해 최대한 충실하게 포팅했습니다.

새 코드베이스를 통해 TypeScript 7은 네이티브 코드 속도, 공유 메모리 멀티스레딩, 여러 새로운 최적화를 제공합니다. 전체 빌드에서는 보통 8~12배 빨라집니다.

다른 릴리스와 마찬가지로 TypeScript 7은 npm으로 설치할 수 있습니다.

```sh
npm install -D typescript
```

이 명령은 워크스페이스에 새 `tsc` 실행 파일을 설치하며, `npx tsc`로 실행할 수 있습니다. TypeScript 사용 경험에서 큰 비중을 차지하는 것은 편집기 지원이기도 합니다. 선호하는 코드 편집기는 새 언어 서버 프로토콜(LSP) 지원과 속도·멀티스레딩 개선을 통해 TypeScript 7을 쉽게 지원할 수 있습니다. VS Code, Visual Studio, WebStorm 등 어떤 현대적인 편집기를 사용하든 TypeScript 7은 원활히 동작해야 합니다.

편집기 문서를 확인하세요. 예를 들어 VS Code에는 지금 사용할 수 있는 [TypeScript 7 전용 확장](https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.native-preview)이 있으며, Visual Studio는 워크스페이스에 맞춰 TypeScript 7을 자동 활성화합니다.

## 더 빠른 TypeScript는 무엇을 의미할까?

더 빠른 TypeScript는 멋지게 들리지만 실제로는 어떤 의미일까요? 개발의 모든 단계에서 TypeScript가 어디에 등장하는지 생각해 보면 도움이 됩니다.

일반적인 개발 일과에는 편집기를 열고, TypeScript 파일을 열고, 프로젝트 전체에서 모든 참조 찾기 같은 작업을 실행하는 일이 포함됩니다. 편집 중에는 자동 완성이 나타나고, 편집하는 즉시 오류를 표시하는 빨간 밑줄이 나타나기를 기대할 수 있습니다. 프로젝트를 빌드할 준비가 되면(최근에는 AI 에이전트가 준비할 수도 있습니다) `tsc`를 실행하고, 출력에서 오류를 확인한 뒤 생성된 코드를 실행합니다.

더 빠른 TypeScript는 이 모든 과정을 간소화합니다. 편집기가 프로젝트를 완전히 불러오기까지의 대기 시간이 거의 즉각적으로 느껴집니다. 모든 참조 찾기, 자동 완성, 진단의 지연 시간은 이전의 일부가 됩니다. `--watch` 모드를 포함해 `tsc`를 실행할 때 피드백 루프가 짧아져 전보다 빠르게 반복할 수 있습니다.

실제 프로젝트에서도 이를 확인할 수 있으며, 몇몇 오픈 소스 프로젝트에서 직접 비교해 볼 수 있습니다. 다음은 상당히 큰 오픈 소스 코드베이스에서 TypeScript 6과 7의 빌드 시간입니다.

| 코드베이스 | TypeScript 6 | TypeScript 7 | 개선 폭 |
| ---------- | -----------: | -----------: | ------: |
| vscode     |      125.7초 |       10.6초 |  11.9배 |
| sentry     |      139.8초 |       15.7초 |   8.9배 |
| bluesky    |       24.3초 |        2.8초 |   8.7배 |
| playwright |       12.8초 |       1.47초 |   8.7배 |
| tldraw     |       11.2초 |       1.46초 |   7.7배 |

TypeScript 7은 일반적으로 빌드 전체 기간에 걸쳐 사용하는 총 메모리도 더 적습니다.

| 코드베이스 | TypeScript 6 | TypeScript 7 | 메모리 변화 |
| ---------- | -----------: | -----------: | ----------: |
| vscode     |        5.2GB |        4.2GB |        -18% |
| sentry     |        4.9GB |        4.6GB |         -6% |
| bluesky    |        1.8GB |        1.3GB |        -26% |
| playwright |        1.0GB |        0.9GB |        -11% |
| tldraw     |        0.6GB |        0.5GB |        -15% |

물론 전체 빌드만이 전부는 아닙니다. 같은 컴퓨터에서 VS Code 코드베이스의 오류가 있는 파일을 열 때, 이전에는 편집기를 연 시점부터 첫 오류를 볼 때까지 약 17.5초가 걸렸습니다. TypeScript 7에서는 1.3초 미만으로, 13배 이상 빠릅니다.

## 충분한 실전 검증, 프로덕션 준비 완료

TypeScript 프로젝트에는 10년이 넘는 기간에 걸쳐 구축된 수만 개의 테스트가 있으며, `main` 브랜치의 모든 커밋에서 실행됩니다. 이 테스트들은 모든 릴리스가 안정적이고 신뢰할 수 있도록 보장해 왔습니다.

하지만 TypeScript 7은 평범한 릴리스가 아닙니다. 테스트 스위트 외에도 TypeScript 7이 프로덕션에 견고한지 확인하기 위해 다양한 수단을 활용했습니다.

지난 1년 동안 많은 내부·외부 대규모 팀과 함께 실제 코드베이스에서 TypeScript 7을 테스트했습니다. 결과는 압도적으로 긍정적이었습니다. 여러 회사가 TypeScript 7이 안정적이고 빠르며 도입하기 쉽다고 보고했습니다. 예를 들어 VS Code 팀은 최근 [TypeScript 7 미리 보기 릴리스 사용 경험](https://code.visualstudio.com/blogs/2026/06/15/typescript-native)을 공유하며 개발 주기가 더 빨라진 점을 강조했습니다.

Loop, Office, PowerBI, Teams, Xbox 같은 Microsoft 팀과도 협력하여 가장 큰 코드베이스에도 TypeScript가 준비되어 있는지 확인했습니다. Bloomberg, Canva, Figma, Google, Lattice, Linear, Miro, Notion, Sentry, Slack, Vanta, Vercel, VoidZero 등도 코드베이스에서 TypeScript 7을 테스트하고 개선을 위한 피드백을 제공했습니다.

더불어 폭넓은 테스트 인프라의 상당 부분을 TypeScript 7에서 실행되도록 다시 구축했습니다. TypeScript 6 및 그 이전 버전에는 컴파일러와 언어 서비스의 회귀를 감지하기 위해 GitHub의 TypeScript·JavaScript 프로젝트를 대상으로 자동 및 수동 테스트가 있었습니다. 이제 동일한 테스트가 TypeScript 7에서 다시 실행되어, 실제 코드베이스의 문제를 찾아 핵심 테스트 스위트의 공백을 메우고 더 나은 경험을 제공하도록 돕습니다.

명시적인 피드백, 자동 크래시 보고, 적극적인 테스트의 조합은 품질에 측정 가능한 차이를 만들었습니다. 데이터에 따르면 TypeScript 7.0의 새 언어 서버는 TypeScript 6.0과 비교해 실패하는 언어 서버 명령을 80% 이상, 서버 크래시를 60% 이상 줄였습니다.

대규모 팀으로부터 받은 주요 피드백은 다음과 같습니다.

- Slack 엔지니어들은 TypeScript 7이 병합 대기열 시간을 40% 없애고, CI 타입 검사 시간을 약 7.5분에서 1.25분으로 줄였다고 전했습니다. 이전에는 언어 서버 로드 시간 때문에 로컬 편집 경험을 거의 사용할 수 없었고, 전체 타입 검사는 대체로 CI에 맡겼습니다. TypeScript 7은 같은 코드베이스를 몇 초 안에 불러와 로컬 타입 검사를 다시 실용적으로 만들었습니다.
- Vanta의 빌드는 크게 개선되었으며, 가장 큰 프로젝트 중 하나에서 [최대 9배의 속도 향상](https://bsky.app/profile/vanta.com/post/3ltc5hdzrls2d)을 보였습니다.
- Microsoft News Services 팀은 TypeScript 7 도입으로 CI 빌드를 기다리는 시간이 한 달에 400시간 줄었다고 말했습니다.
- 작년 PowerBI 개발자들은 대규모 코드베이스에서 편집기용 TypeScript 7을 “구명줄”이라고 표현했습니다. VS Code에서 이름 바꾸기 기능을 지원하기 전부터 이 경험을 기본값으로 채택했습니다.
- Loop 모노레포 개발자들도 매우 긍정적인 반응을 보였습니다. 이전 편집기 경험은 해당 규모에서 사용할 수 없는 수준이었지만, TypeScript 7 경험은 “놀랍다”고 평가했습니다.
- Canva 개발자들은 언어 서비스가 첫 오류를 표시하기까지 걸리는 시간이 약 58초에서 약 4.8초로 크게 단축되었다고 전했습니다.

## TypeScript 6.0과 나란히 실행하기

TypeScript 7.0은 출시되었지만 API는 제공하지 않습니다. TypeScript 7.1에는 새롭고 다른 API가 제공될 것으로 예상합니다. 그때까지는 `typescript-eslint`처럼 컴파일러에 프로그래밍 방식으로 접근해야 하는 도구를 위해 TypeScript 6.0과 나란히 실행할 수 있도록 하는 것을 우선순위로 두었습니다.

6.0/7.0 전환 과정의 일부로 새 호환 패키지 `@typescript/typescript6`를 게시했습니다. 이 패키지는 `tsc6` 실행 파일을 제공하므로, 자체 `tsc` 바이너리를 제공하는 TypeScript 7.0과 이름 충돌 없이 함께 설치할 수 있습니다. 또한 TypeScript 6.0 API를 다시 내보내므로, `tsc`는 TypeScript 7에 사용하고 다른 도구는 계속 6.0에 의존하게 할 수 있습니다.

`typescript-eslint`처럼 peer dependency를 통해 `typescript`에서 직접 import해야 하는 도구도 있으므로, npm alias를 사용하는 방법을 권장합니다. 다음 명령을 실행할 수 있습니다.

```sh
npm install -D typescript@npm:@typescript/typescript6
```

또는 `package.json`을 다음처럼 수정합니다.

```json
{
  "devDependencies": {
    "typescript": "npm:@typescript/typescript6@^6.0.2"
  }
}
```

이 방법을 사용하면 `tsc6` 실행 파일만 남습니다. 7.0의 `tsc`도 사용하려면 TypeScript 7에 대한 별칭을 하나 더 추가합니다. 그러면 `npx tsc`가 7.0으로 정상 동작합니다.

```json
{
  "devDependencies": {
    "@typescript/native": "npm:typescript@^7.0.2",
    "typescript": "npm:@typescript/typescript6@^6.0.2"
  }
}
```

### Nightly 빌드와 `@typescript/native-preview`

그동안 대부분의 개발자는 `@typescript/native-preview` 패키지로 TypeScript 7을 설치했습니다. 이 패키지는 새 코드베이스의 nightly 빌드를 제공했으며, 주당 다운로드 수가 850만 회를 넘을 만큼 커뮤니티에 유용했습니다.

앞으로 nightly 빌드는 표준 `typescript` 패키지의 `next` 태그에서 다시 제공될 예정입니다. 다음과 같이 설치할 수 있습니다.

```sh
npm install -D typescript@next
```

## 맞춤형 확장: 병렬화와 제어 옵션

TypeScript 7.0은 파싱, 타입 검사, emit을 포함한 많은 단계를 병렬로 수행합니다. 파싱과 emit 같은 단계는 대체로 파일 간에 독립적으로 수행할 수 있으므로, 상대적으로 적은 오버헤드로 더 큰 코드베이스에 맞춰 병렬 처리가 잘 확장됩니다. 하지만 TypeScript 빌드의 모든 단계를 쉽게 병렬화할 수 있는 것은 아닙니다.

TypeScript 7은 타입 검사와 프로젝트 참조 빌드처럼 더 복잡한 단계의 병렬화 동작을 조정하는 실험적 `--checkers`, `--builders` 플래그를 도입했습니다. 병렬 처리를 완전히 끄는 `--singleThreaded` 플래그도 도입했으며, 디버깅이나 자원이 제한된 환경에서 유용합니다.

### 타입 검사기 병렬화

타입 검사 같은 단계는 파일 사이에 더 복잡한 의존성이 있습니다. 대부분의 파일은 의존성 및 전역 범위의 동일한 타입 정보에 의존합니다. 따라서 타입 검사기를 완전히 독립적으로 실행하면 계산과 메모리 모두 낭비가 됩니다. 한편 타입 검사는 때때로 프로그램 정보의 상대적인 순서에 의존하므로, 처음부터 타입 검사할 때는 항상 같은 파일을 동일한 순서로 검사하여 같은 결과를 보장해야 합니다.

이러한 문제를 피하면서 병렬화를 가능하게 하기 위해, TypeScript 7.0은 각자 세상을 바라보는 고정 수의 타입 검사기 worker를 만듭니다. 이 worker들이 일부 공통 작업을 중복할 수는 있지만, 같은 입력 파일이 주어지면 항상 동일하게 파일을 분할하고 같은 결과를 생성합니다.

기본 타입 검사 worker 수는 4개이며 새 `--checkers` 플래그로 설정할 수 있습니다. CPU 코어가 많은 일반적인 대형 코드베이스에서는 이 수를 늘려 빌드를 더 빠르게 할 수 있지만, 보통 메모리 사용량이 증가합니다. 위 표에서는 기본값인 `--checkers 4`로 TypeScript 7을 실행했습니다. 같은 머신에서 `--checkers 8`로 실행한 결과는 다음과 같습니다.

| 코드베이스 | TypeScript 6 | TypeScript 7 (`--checkers 8`) | 개선 폭 |
| ---------- | -----------: | ----------------------------: | ------: |
| vscode     |      125.7초 |                        7.51초 |  16.7배 |
| sentry     |      139.8초 |                       12.08초 |  11.6배 |
| bluesky    |       24.3초 |                        2.01초 |  12.1배 |
| playwright |       12.8초 |                        1.16초 |    11배 |
| tldraw     |       11.2초 |                        1.06초 |  10.6배 |

더 많은 코어를 할당하면 이 코드베이스들은 더 큰 향상을 얻지만, 결과는 프로젝트와 머신에 따라 다릅니다.

반대로 CPU 코어와 메모리가 적은 머신(예: CI runner)에서는 불필요하거나 부수적인 오버헤드를 피하기 위해 이 수를 줄이는 것이 좋을 수 있습니다. `--checkers 1`처럼 낮은 값도 지정할 수 있으며, 이 경우 타입 검사는 사실상 단일 스레드로 동작해 중복 작업이 제거됩니다.

드물게 `--checkers` 수가 달라지면 순서 의존적인 결과가 드러날 수 있습니다. 팀의 모든 빌드 환경에서 고정된 checker 수를 지정하면 모두가 같은 결과를 얻는 데 도움이 되지만, 이는 팀의 판단에 달려 있습니다.

### 프로젝트 참조 builder 병렬화

TypeScript 7.0은 프로젝트 내부 빌드를 병렬화할 수 있을 뿐 아니라, 여러 프로젝트를 한 번에 빌드할 수도 있습니다. `--build` 실행 시 동시에 실행할 수 있는 병렬 프로젝트 참조 builder 수를 제어하는 새 `--builders` 플래그로 이를 설정합니다. 많은 프로젝트를 가진 모노레포에서 특히 유용할 수 있습니다.

`--checkers`와 마찬가지로 builder 수를 늘리면 빌드는 빨라질 수 있지만 메모리 사용량이 늘어날 수 있습니다. 또한 `--checkers`와 곱해지는 효과가 있으므로, 머신과 코드베이스에 맞는 균형을 찾아야 합니다. 예를 들어 `--checkers 4 --builders 4`로 빌드하면 최대 16개의 타입 검사기가 동시에 실행되므로 과도할 수 있습니다.

`--checkers`와 달리 builder 수를 바꿔도 다른 결과가 생기지는 않아야 합니다. 다만 프로젝트 참조 빌드는 본질적으로 프로젝트 의존성 그래프에 의해 병목이 생깁니다. 단, `--isolatedDeclarations`와 별도의 문법적 선언 파일 emit을 활용하는 코드베이스의 타입 검사는 예외입니다.

### 단일 스레드 모드

경우에 따라 컴파일러 전체를 단일 스레드로 강제하는 것이 도움이 됩니다. 디버깅, TypeScript 6과 7의 성능 비교, 외부에서 병렬 빌드를 조정하는 경우, 자원이 매우 제한된 환경에서 유용할 수 있습니다. 새 `--singleThreaded` 플래그로 활성화합니다. 이 플래그는 타입 검사 worker 수를 1로 제한할 뿐 아니라 파싱과 emit도 단일 스레드에서 수행하도록 보장합니다.

## 개선된 `--watch` 모드

TypeScript 7은 완전히 다시 구축된 `--watch` 모드를 제공합니다. 새로운 `--watch`는 효율적이고 안정적인 크로스 플랫폼 파일 감시 기능을 제공하는 [Parcel bundler의 file watcher](https://github.com/parcel-bundler/watcher)를 바탕으로 한 새 기반 위에서 동작합니다.

파일 감시 로직을 포팅하면서 Go에서의 크로스 플랫폼 파일 감시 문제를 몇 가지 만났습니다. 표준 라이브러리에는 내장 파일 감시 API가 없고, 조사한 기존 타사 라이브러리는 안정성, 성능, 크로스 플랫폼 지원 또는 빌드 도구 통합에서 여러 문제가 있었습니다.

주기적으로 파일 변경을 확인하는 polling 기반 해결책을 만들 수 있었고, 이는 운영체제 전반에서 동작했습니다. 그러나 특히 `node_modules`에 의존성이 많은 대규모 프로젝트에서는 계산 비용이 높았습니다. 동적 스케줄링 전략을 적용해도 순수 polling 방식은 일반 용도로 쓰기에는 부담이 컸습니다.

Visual Studio Code는 오랫동안 [@parcel/watcher](https://www.npmjs.com/package/@parcel/watcher)에 의존했으며, 최근 몇 년간 VS Code의 TypeScript도 간접적으로 그 파일 감시 기능을 사용했습니다. 유망해 보였지만 Parcel watcher는 C++로 작성되어 전체 C++ 도구 체인이 필요하다는 문제가 있었습니다.

VS Code에서 Parcel watcher를 사용한 긍정적인 경험을 바탕으로, 새 도구 체인 의존성을 추가하지 않기 위해 최소한의 assembly shim을 사용하여 Go로 포팅하는 방법을 살펴보았습니다.

이 시도는 성공적이었습니다. C++에서 Go로 매우 직접적으로 번역한 코드로 시작해, 포팅된 테스트 스위트를 통과하는 관용적인 Go 코드로 다듬었습니다. watcher는 감시 대상과 이유 사이에 관심사를 명확히 분리할 수 있는 독립 패키지입니다. 현재 여러 플랫폼에서 `--watch` 모드의 자원 사용이 크게 개선되었고, TypeScript 7 초기 사용자들로부터 긍정적인 피드백을 받고 있습니다.

Parcel 작업으로 Visual Studio Code와 TypeScript 프로젝트 모두에 막대한 이점을 준 Devon Govett에게 감사를 전합니다. 이 포트가 시간이 지남에 따라 원래 Parcel watcher 코드베이스에도 기회와 통찰을 제공하기를 바랍니다.

## 5.x 이후의 업데이트와 6.0에서 새로 도입된 동작

TypeScript 7.0은 TypeScript 6.0의 타입 검사와 명령줄 동작에 호환되도록 제작되었습니다. 실제로 `stableTypeOrdering` 플래그를 켜고 `ignoreDeprecations` 플래그를 설정하지 않은 상태에서 TypeScript 6.0으로 깨끗하게 컴파일되는 거의 모든 TypeScript 코드는 TypeScript 7.0에서도 동일하게 컴파일되어야 합니다.

다만 TypeScript 7.0은 6.0의 새 기본값을 채택하고, TypeScript 6.0에서 deprecated였던 플래그와 구문에는 hard error를 제공합니다. 6.0도 비교적 새 버전이므로 많은 프로젝트가 새 동작에 적응해야 할 수 있습니다. TypeScript 7.0으로의 전환을 쉽게 하려면 TypeScript 6.0을 먼저 도입하는 것이 좋습니다. deprecated 항목의 자세한 내용은 [TypeScript 6.0 릴리스 블로그 글](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)에서 확인할 수 있습니다.

설정에서 눈에 띄는 기본값 변경은 다음과 같습니다.

- `strict`의 기본값은 `true`입니다.
- `module`의 기본값은 `esnext`입니다.
- `target`의 기본값은 `esnext` 직전의 현재 안정 ECMAScript 버전입니다.
- `noUncheckedSideEffectImports`의 기본값은 `true`입니다.
- `libReplacement`의 기본값은 `false`입니다.
- `stableTypeOrdering`의 기본값은 `true`이며 끌 수 없습니다.
- `rootDir`의 기본값이 이제 `./`이며, 내부 source 디렉터리는 명시적으로 설정해야 합니다.
- `types`의 기본값이 이제 `[]`입니다. 이전 동작은 `["*"]`로 설정해 복원할 수 있습니다.

`rootDir`와 `types` 변경이 가장 놀랍게 느껴질 수 있지만 쉽게 완화할 수 있습니다. `tsconfig.json`이 `src` 같은 디렉터리 밖에 있는 프로젝트는 동일한 디렉터리 구조를 유지하기 위해 `rootDir`를 포함하면 됩니다.

```jsonc
{
  "compilerOptions": {
    // ...
    "rootDir": "./src",
  },
  "include": ["./src"],
}
```

`types` 변경에 따라 특정 전역 선언에 의존하는 프로젝트는 필요한 항목을 명시해야 합니다.

```jsonc
{
  "compilerOptions": {
    // 필요한 @types 패키지를 명시합니다. 예: bun, mocha, jasmine 등
    "types": ["node", "jest"],
  },
}
```

더 이상 동작하지 않으며 hard error가 되는 deprecated 항목은 다음과 같습니다.

- `target: es5`는 더 이상 지원되지 않습니다.
- `downlevelIteration`은 더 이상 지원되지 않습니다.
- `moduleResolution: node/node10`은 더 이상 지원되지 않습니다. 대신 `nodenext` 또는 `bundler`를 권장합니다.
- `module: amd`, `umd`, `systemjs`, `none`은 더 이상 지원되지 않습니다. bundler 또는 브라우저 기반 모듈 해석과 함께 `esnext` 또는 `preserve`를 권장합니다.
- `baseUrl`은 더 이상 지원되지 않습니다. `paths`는 `baseUrl`이 아닌 프로젝트 루트를 기준으로 상대 경로를 사용하도록 갱신할 수 있습니다.
- `moduleResolution: classic`은 더 이상 지원되지 않습니다. `bundler` 또는 `nodenext`가 권장 대체물입니다.
- `esModuleInterop`과 `allowSyntheticDefaultImports`를 `false`로 설정할 수 없습니다.
- `alwaysStrict`는 `true`로 간주되며 `false`로 설정할 수 없습니다.
- namespace 선언에서 `module` 키워드를 사용할 수 없습니다.
- import에는 `asserts` 키워드를 사용할 수 없고, ECMAScript import attribute 구문 변화에 맞춰 `with` 키워드를 사용해야 합니다.
- `skipDefaultLibCheck`에서는 `/// <reference no-default-lib />` directive가 더 이상 적용되지 않습니다.
- 현재 디렉터리에 `tsconfig.json` 파일이 있으면, 명시적으로 `--ignoreConfig` 플래그를 전달하지 않는 한 명령줄 빌드에 파일 경로를 전달할 수 없습니다.

### 템플릿 리터럴 타입이 이제 Unicode 코드 포인트를 보존함

TypeScript 7.0은 템플릿 리터럴 타입에서 추론할 때 Unicode 코드 포인트를 더 자연스럽게 처리합니다.

```ts
type HeadTail<S> = S extends `${infer Head}${infer Tail}`
  ? [Head, Tail]
  : never;

type Result = HeadTail<'😀abc'>;
//   ^
// 7.0: ["😀", "abc"]
// 이전: ["\ud83d", "\ude00abc"]
```

이전에는 JavaScript의 UTF-16 인덱싱 동작을 따르므로 `"😀abc"`를 서로게이트 쌍의 두 부분(`\ud83d`, `\ude00`)으로 나누었습니다. 이는 JavaScript 인덱싱과 기술적으로 일관적이었습니다. 예를 들어 추론된 `Head` 타입은 `"😀abc"[0]`과 같았습니다. 그러나 일반적으로 의도한 동작은 아니었고, 의미상 유효하지 않은 짝 없는 서로게이트를 포함한 문자열 리터럴 타입을 만들 수 있었습니다.

이는 UTF-16 코드 단위를 의도적으로 모델링한 타입 수준 문자열 조작(일부 문자열 `Length` 유틸리티 등)에는 breaking change입니다. 실제로는 새 동작이 더 유용하고 덜 놀랍다고 예상합니다. 이제 템플릿 리터럴 추론은 `for...of`로 문자열을 순회하거나 `[...str]`로 펼칠 때와 같은 직관을 따르며, `"😀"`를 하나의 단위로 처리합니다.

### JavaScript 차이점

기존 코드베이스를 포팅하면서 JavaScript 지원 방식도 다시 검토했습니다.

TypeScript는 원래 JSDoc 주석과 특정 코드 패턴 인식을 통해 JavaScript 파일을 지원하고 분석 및 타입 추론을 수행했습니다. 대부분은 널리 쓰이는 코딩 패턴에 기반했지만, 때로는 Closure나 JSDoc 문서 생성 도구가 이해할 법한 모든 코드를 기반으로 했습니다.

이 접근은 느슨하게 작성된 JSDoc 코드베이스의 개발자에게 유용했지만, 잘 동작하려면 여러 타협과 특수 처리가 필요했고 `.ts` 파일의 TypeScript 분석과 여러 면에서 달라졌습니다.

TypeScript 7.0에서는 JavaScript 지원을 TypeScript 파일 분석과 더 일관되도록 다시 만들었습니다. 차이점은 다음과 같습니다.

- 타입이 필요한 곳에 값을 사용할 수 없습니다. 대신 `typeof someValue`를 작성합니다.
- `@enum`은 더 이상 특별히 인식되지 않습니다. `(typeof YourEnumDeclaration)[keyof typeof YourEnumDeclaration]`에 `@typedef`를 만듭니다.
- 단독 `?`는 더 이상 타입으로 쓸 수 없습니다. 대신 `any`를 사용합니다.
- `@class`는 함수를 constructor로 만들지 않습니다. 대신 `class` 선언을 사용합니다.
- 후위 `!`는 지원하지 않습니다. 그냥 `T`를 사용합니다.
- 타입 이름은 식별자 옆이 아니라 `@typedef` 태그 내부에 정의해야 합니다. 즉, `/** @typedef {T} TypeAliasName */`을 사용하고 `/** @typedef {T} */ TypeAliasName;`은 사용하지 않습니다.
- Closure 스타일 함수 문법(예: `function(string): void`)은 더 이상 지원하지 않습니다. `(s: string) => void` 같은 TypeScript 축약 문법을 사용합니다.

또한 `this`의 별칭을 만들거나 함수의 `prototype` 전체를 재할당하는 일부 JavaScript 패턴은 더 이상 특별하게 처리되지 않습니다.

JavaScript 지원의 일부는 아직 변화 중입니다. TypeScript 6.0과 7.0의 차이를 더 자세히 정리한 [CHANGES.md](https://github.com/microsoft/typescript-go/blob/main/CHANGES.md)를 계속 갱신하고 있습니다.

## 편집기 경험

앞서 언급했듯 TypeScript 7.0의 성능 개선은 명령줄 경험에만 국한되지 않고 편집기 경험에도 적용됩니다. VS Code 사용자는 [TypeScript 7 전용 확장](https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.native-preview)을 사용할 수 있습니다. 설치하면 자동으로 기본 경험이 됩니다.

명령 팔레트의 “Disable TypeScript 7 Language Server” 및 “Enable TypeScript 7 Language Server” 명령으로 언제든지 비활성화하거나 다시 활성화할 수 있습니다. 향후 몇 주 안에 TypeScript 7 지원이 VS Code 자체에도 포함될 예정입니다.

Visual Studio 사용자는 최신 IDE 버전이 워크스페이스에 따라 TypeScript 7을 자동 활성화합니다. 별도로 할 일은 없습니다.

물론 TypeScript 7은 어떤 편집기에서도 잘 동작해야 합니다. 새 기반은 언어 서버 프로토콜(LSP)로 구축되었고, 가능한 한 빠르게 동시에 요청을 처리하기 위해 여러 스레드를 활용할 수 있습니다.

첫 공개 이후 자동 import, 확장 가능한 hover, inlay hint, code lens, 소스 정의로 이동, JSX 연결 편집과 태그 완성 등 빠졌던 기능을 추가했습니다. TypeScript 7.0 베타에서 빠졌던 semantic highlighting, “sort imports”, “remove unused imports” 등도 이제 지원합니다.

지난 몇 달 동안 성능과 안정성도 계속 개선했습니다. GitHub의 주요 TypeScript·JavaScript 코드베이스를 대상으로 언어 서버 fuzz 테스트를 수행할 수 있도록 테스트와 진단 인프라의 상당 부분을 다시 만들었습니다. 앞서 설명했듯 TypeScript 7의 새 언어 서버는 TypeScript 6보다 훨씬 안정적입니다.

### TypeScript와 임베디드 언어

Vue, MDX, Astro, Svelte 등을 사용하는 워크플로는 아직 TypeScript 7을 활용하지 못할 가능성이 높습니다. Angular처럼 템플릿 안에서 특화된 타입 검사를 하는 경우도 마찬가지입니다. 주된 이유는 TypeScript 7이 아직 안정적인 프로그래밍 API를 노출하지 않으므로, TypeScript를 자체 컴파일러와 언어 서비스에 임베드하는 도구(예: Volar)가 현재 TypeScript 6.0에만 의존할 수 있기 때문입니다.

이는 일시적인 문제라고 예상하며, 이를 해결하기 위해 노력하고 있습니다. 해당 프로젝트의 유지 관리자와 적극적으로 협력해 TypeScript 7이 이 워크플로를 지원하도록 할 계획입니다.

그때까지 언어 서버 플러그인이 필요하지 않은 상황에서 TypeScript 7을 사용하는 것을 권장합니다. Angular 프로젝트는 CLI의 `tsc`에서 TypeScript 7을 사용해 빠르게 프로젝트 전체 오류를 탐지하고, 편집기 지원에는 TypeScript 6.0을 함께 사용할 수 있습니다. Vue, MDX, Astro, Svelte 등을 쓰는 프로젝트는 당분간 TypeScript 6.0을 계속 사용해야 합니다. VS Code에서는 “Disable TypeScript 7 Language Server” 명령으로 TypeScript 6.0으로 되돌릴 수 있습니다.

## 앞으로의 방향

TypeScript 7.0은 TypeScript 프로젝트의 중요한 이정표입니다. 이 포트는 1년 넘게 팀의 주요 초점이었으며, 7.0 출시 후에는 새 기능 작업, 사용성 개선, 추가 성능 향상, 더 넓은 생태계를 위한 새 API 구현으로 돌아갈 것입니다. 큰 변화처럼 보이지만, TypeScript 7 이전과 비슷한 일정으로 3~4개월마다 새 기능을 담은 버전을 출시할 것으로 예상합니다.

TypeScript 7.1을 앞두고 커뮤니티가 함께 나아갈 수 있도록 남은 공백을 메우기를 바랍니다.

TypeScript 7.0 사용 경험을 온라인에서 공유해 주세요. [Bluesky의 @typescriptlang.org](https://bsky.app/profile/typescriptlang.org), [Mastodon의 @typescript@fosstodon.org](https://fosstodon.org/@typescript), [X의 @typescript](https://twitter.com/typescript)를 팔로우하거나 태그해 의견을 알려 주세요.

이 새 릴리스가 TypeScript 생태계에 매우 큰 가치를 제공할 것이라 믿습니다. 일상적인 코딩 경험이 더 빠르고, 즐겁고, 생산적이며, 기쁨으로 가득하기를 바랍니다.

TypeScript 도구 모음의 네이티브 시대에 오신 것을 환영합니다.

즐겁게 해킹하세요!

— TypeScript 팀
