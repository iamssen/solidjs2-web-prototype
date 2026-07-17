import type { Element } from 'solid-js';
import { ArrayHandler } from './array-handler.tsx';
import { Batching } from './batching.tsx';
import { CustomEventHandlers } from './custom-event-handlers.tsx';
import { Effects } from './effects.tsx';
import { ForList } from './for-list.tsx';
import { MergeOmit } from './merge-omit.tsx';
import { OnAttributes } from './on-attributes.tsx';
import { OnSettled } from './on-settled.tsx';
import { SpreadEventHandler } from './spread-event-handler.tsx';
import { StoreDraft } from './store-draft.tsx';

export function RuntimeChecks(): Element {
  return (
    <>
      <ArrayHandler />
      <Batching />
      <OnAttributes />
      <OnSettled />
      <CustomEventHandlers />
      <Effects />
      <SpreadEventHandler />
      <ForList />
      <MergeOmit />
      <StoreDraft />
    </>
  );
}
