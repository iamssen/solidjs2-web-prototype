# 특정 HTMLElement를 root로 쓰는 component의 props

고정된 HTML element 하나를 root로 쓰는 component에는 다음 선언을 기본으로 사용한다.

```ts
interface DivProps extends JSX.HTMLAttributes<HTMLDivElement> {}

function Div(props: DivProps): Element {
  return <div {...props} />;
}
```

이 방식은 `<div>`에 일반적으로 전달하는 `class`, `style`, `id`, `data-*`, `aria-*`,
`children`, `ref`, event handler를 받을 수 있게 한다. type parameter가
`HTMLDivElement`이므로 event handler의 `event.currentTarget`과 ref callback element도
`HTMLDivElement`로 정확하게 추론된다.

## 왜 이 선언을 기본으로 쓰는가

component가 고정된 root element를 쓰되, 일부 자체 props와 동작을 추가하는 경우가
가장 흔하다. `interface` 상속은 이때 native HTML props에 component 전용 props를
자연스럽게 더할 수 있다.

```ts
interface PanelProps extends JSX.HTMLAttributes<HTMLDivElement> {
  tone?: 'neutral' | 'danger';
}
```

`tone`처럼 DOM에 전달하면 안 되는 component 전용 props가 있다면 Solid 2의 `omit`으로
제외한 뒤 나머지만 root element에 spread한다. props를 일반 객체로 destructuring하면
반응성을 잃을 수 있으므로 피한다.

```ts
function Panel(props: PanelProps): Element {
  const divProps = omit(props, 'tone');

  return <div {...divProps} data-tone={props.tone} />;
}
```

## `JSX.IntrinsicElements['div']`가 필요한 경우

`JSX.HTMLAttributes<HTMLDivElement>`는 일반 HTML attribute와 event handler를 위한
타입이다. JSX에서 실제 `<div>`에 허용되는 전체 props는 다음 타입이다.

```ts
JSX.IntrinsicElements['div'];
// JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>
```

뒤의 `JSX.Properties<HTMLDivElement>`는 element-specific DOM property를 `prop:*` 형태로
전달하는 경우까지 포함한다. 따라서 component가 자체 props나 동작 없이 native tag의
모든 JSX props를 완전히 투명하게 전달해야 할 때만
`JSX.IntrinsicElements['div']`을 사용한다.

일반적인 `<div>` component에는 이런 `prop:*` 전달이 거의 필요 없으므로,
`JSX.HTMLAttributes<HTMLDivElement>`가 더 작고 의도가 분명한 기본 선택이다. `input`,
`button`처럼 tag별 attribute가 중요한 wrapper는 해당 tag의
`JSX.IntrinsicElements['input']`, `JSX.IntrinsicElements['button']`을 검토한다.
