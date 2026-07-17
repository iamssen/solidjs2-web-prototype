# Plain prop getter chain

`<PlainMultipassChild num={num()} />`는 `num()`의 결과를 컴포넌트 생성 시점에
일반 객체에 고정해 넣지 않는다. JSX 컴파일 결과는 개념적으로 다음 getter를 만든다.

```ts
const props = {
  get num() {
    return num();
  },
};
```

중간 컴포넌트의 `num={props.num}`도 상위 prop을 다시 읽는 getter로 변환된다.

```ts
const childProps = {
  get num() {
    return props.num;
  },
};
```

그래서 마지막 JSX가 `props.num`을 읽으면 getter들을 거슬러 올라가 원래 signal의
`num()`을 읽는다. TypeScript 타입이 `number`여도 runtime의 property는 getter일 수
있다.

```text
마지막 props.num
→ 상위 props.num
→ 최초 props.num getter
→ 부모의 num()
```

반대로 컴포넌트 함수의 최상단에서 값을 복사하면 getter를 그 자리에서 평가한 일반
숫자 스냅샷이 된다. 이후 JSX가 지역 변수를 읽어도 갱신되지 않는다.

```tsx
function BrokenChild(props: { num: number }) {
  const num = props.num;
  return <p>{num}</p>;
}
```

화면에 값을 표시하거나 그대로 다음 컴포넌트에 전달하는 용도라면 plain prop이
간결하다. 반면 호출하는 쪽에 “필요할 때 값을 읽는 함수”라는 API를 드러내거나,
일반 TypeScript 함수에 전달해야 한다면 `Accessor<number>` prop이 더 명확하다.
