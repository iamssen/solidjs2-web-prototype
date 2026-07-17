# `PlainMultipassChild2`는 `num` 변경을 어떻게 다시 렌더링하는가

`PlainMultipassChild2`는 signal이나 accessor를 prop으로 직접 받지 않는다.
`props.num`을 읽어 `number` 값을 받을 뿐이다.

그런데 `setNum(...)` 뒤에는 `{props.num}`이 새 값으로 다시 렌더링된다. 이 문서는
그 연결이 처음 만들어지는 지점만 설명한다.

## 1. `props.num`은 원본 `num()`까지 도달한다

출발점은 다음 JSX다.

```tsx
<PlainMultipassChild num={num()} />
```

컴파일러는 이 값을 즉시 고정해서 넘기지 않는다. 핵심은 대략 다음과 같은 getter다.

```ts
const rootProps = {
  get num() {
    return num();
  },
};
```

중간의 `num={props.num}`도 상위 prop을 다시 읽는 getter가 된다.

```ts
const child1Props = {
  get num() {
    return rootProps.num;
  },
};

const child2Props = {
  get num() {
    return child1Props.num;
  },
};
```

따라서 `PlainMultipassChild2`의 `{props.num}`은 아래 순서로 실행된다.

```text
child2Props.num
→ child1Props.num
→ rootProps.num
→ num()
→ read(signalNode)
```

각 getter의 최종 반환값은 현재 `number` 값이다. signal object나 구독 정보가 prop
값에 실려 전달되는 것은 아니다.

## 2. `{props.num}`을 위한 렌더 계산이 먼저 활성화된다

`{props.num}`은 한 번 읽고 끝나는 코드가 아니다. JSX 렌더러는 이 표현식을 읽고
텍스트 노드를 갱신하는 내부 렌더 계산을 만든다. 여기서는 이를 `child2TextRender`라고
부른다.

이 계산을 실행하기 직전에 runtime은 현재 계산을 module-scoped 변수에 잠시 저장한다.
실제 Solid runtime의 변수명은 `context`이며, 아래에서는 이해를 위해
`activeSubscriber`라고 표기한다.

```ts
function runChild2TextRender() {
  const previous = activeSubscriber;
  activeSubscriber = child2TextRender;

  try {
    const value = child2Props.num;
    updateTextNode(value);
  } finally {
    activeSubscriber = previous;
  }
}
```

`activeSubscriber`는 `props.num`에서 얻는 값이 아니다. `{props.num}`의 렌더 계산을
실행하기 때문에 renderer가 먼저 설정하는 현재 실행 문맥이다.

## 3. `read(signalNode)`가 현재 렌더 계산을 signal에 연결한다

`runChild2TextRender()` 안에서 `child2Props.num`을 읽으면 getter chain 끝에서
`num()`이 실행된다. `num()`은 내부적으로 `read(signalNode)`를 호출한다.

그 시점에는 아직 `activeSubscriber === child2TextRender`다. 그래서 `read`는 반환 전에
현재 활성 계산을 signal에 연결한다.

```ts
function read(signalNode) {
  if (activeSubscriber !== null) {
    link(signalNode, activeSubscriber);
  }

  return signalNode.value;
}
```

`link(...)`는 같은 연결을 양쪽에 기록한다.

```text
signalNode.subscribers
  → child2TextRender

child2TextRender.dependencies
  → signalNode
```

그 다음 `read(signalNode)`는 plain number를 반환한다. 반환값은 텍스트 노드를
갱신하는 데만 쓰이며, 구독 정보는 반환값에 들어 있지 않다.

## 4. `setNum(...)` 뒤의 재렌더

이제 signal에는 이전 읽기에서 만들어진 subscriber 연결이 있다. signal 변경이 처리되면
그 연결을 사용해 렌더 계산을 다시 실행한다.

```text
setNum(nextValue)
→ signal 변경 처리
→ signalNode가 subscribers에서 child2TextRender를 찾음
→ child2TextRender를 다시 실행
→ props.num getter chain을 다시 실행
→ num()이 새 number를 반환
→ 텍스트 노드 갱신
```

`PlainMultipassChild2`가 반환된 number를 관찰하는 것이 아니다. 이전 렌더 중 signal에
등록된 `child2TextRender`가 다시 실행되므로 새 값을 다시 읽는다.

## 5. 여러 최종 렌더 계산이 섞이지 않는 이유

각 렌더 계산과 getter chain은 동기적으로 끝까지 실행된다. 따라서 A의
`activeSubscriber`가 설정된 상태에서, A의 getter chain 중간에 관계없는 B가 끼어들 수
없다.

```text
Run A: activeSubscriber = renderA
  read(signalA) → link(signalA, renderA)
Restore previous subscriber

Run B: activeSubscriber = renderB
  read(signalB) → link(signalB, renderB)
Restore previous subscriber
```

중첩 실행도 이전 값을 저장했다가 복원한다.

```text
Run A: activeSubscriber = renderA
  Run B: activeSubscriber = renderB
    read(signalB) → link(signalB, renderB)
  Restore activeSubscriber = renderA
  read(signalA) → link(signalA, renderA)
```

따라서 A의 signal read가 B를 subscriber로 잘못 등록하지 않는다.

## 결론

`props.num`은 원본 `num()`을 호출하는 getter 경로일 뿐이다. 구독 연결은
`props.num`의 반환값으로 전달되지 않는다. `{props.num}`을 실행 중인 렌더 계산이
`activeSubscriber`로 설정된 상태에서 `read(signalNode)`에 도달하고, 그 함수가 현재
렌더 계산을 signal의 subscriber로 연결한다.
