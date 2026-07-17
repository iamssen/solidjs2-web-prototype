# Signal, getter prop, and memo cache

signal, getter prop, `createMemo`는 모두 값을 읽을 수 있게 하지만 캐시 역할은 다르다.

## Signal: 현재 값을 저장

```ts
const [num] = createSignal(0);

num(); // signal이 저장한 현재 값: 0
num(); // 같은 현재 값을 다시 읽음
```

## Getter prop: 읽기 경로만 전달

getter prop은 값을 저장하지 않는다. 읽을 때마다 원래 signal까지 도달한다.

```ts
const props = {
  get num() {
    return num();
  },
};

props.num; // getter → num() → signal의 현재 값
props.num; // getter → num() → 같은 signal의 현재 값
```

## Memo: 파생 계산 결과를 저장

`createMemo`는 의존성이 바뀌기 전까지 계산 결과를 재사용한다.

```ts
const label = createMemo(() => `is ${num()}`);

label(); // 저장된 `is 0` 읽기
label(); // 같은 결과를 다시 읽음
setNum(1); // 저장된 결과가 오래된 값이 됨
```

값을 읽기만 하는 `{props.num}`에는 memo가 필요 없다. 같은 파생 계산을 여러 곳에서
읽거나 계산 비용이 있을 때 memo를 사용한다.

```ts
const withoutCache = () => expensiveCalculation(props.num);
const withCache = createMemo(() => expensiveCalculation(props.num));
```

`withoutCache()`는 호출마다 계산을 실행할 수 있다. `withCache()`는 `props.num`이
바뀔 때만 계산을 다시 실행하고 결과를 재사용한다.
