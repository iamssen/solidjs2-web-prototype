import type { Element } from 'solid-js';
import { createSignal } from 'solid-js';
import { SimpleTable } from '../index.ts';
import type { SimpleTableColumn } from '../index.ts';

type Activity = {
  id: string;
  time: string;
  event: string;
  actor: string;
  source: string;
  ipAddress: string;
  result: string;
};

const createActivity = (): readonly Activity[] => {
  const seed = Math.floor(Math.random() * 10_000);

  return Array.from({ length: 60 }, (_, index) => {
    const value = index + seed;
    const minutes = 9 * 60 + 41 - (value % 60) * 7;
    const hour = Math.floor(minutes / 60);

    return {
      id: `default-${seed}-${index}`,
      time: `${String(hour).padStart(2, '0')}:${String(minutes % 60).padStart(
        2,
        '0',
      )}`,
      event: [
        'Invoice exported',
        'Member invited',
        'Report shared',
        'API key rotated',
      ][value % 4],
      actor: ['Ari Kim', 'Mina Park', 'Jun Lee', 'Sora Choi'][value % 4],
      source: ['Billing', 'Workspace', 'Analytics', 'Developer'][value % 4],
      ipAddress: `192.168.20.${(value % 240) + 10}`,
      result: value % 8 === 0 ? 'Needs review' : 'Completed',
    };
  });
};

const columns = [
  { id: 'time', cell: 'time', header: 'Time', minWidth: 80 },
  { id: 'event', cell: 'event', header: 'Event', minWidth: 210 },
  { id: 'actor', cell: 'actor', header: 'Actor', minWidth: 140 },
  { id: 'source', cell: 'source', header: 'Source', minWidth: 130 },
  { id: 'ipAddress', cell: 'ipAddress', header: 'IP address', minWidth: 140 },
  { id: 'result', cell: 'result', header: 'Result', minWidth: 130 },
] as const satisfies readonly SimpleTableColumn<Activity>[];

export function DefaultPreview(): Element {
  const [activity, setActivity] = createSignal(createActivity());

  return (
    <section>
      <h2>Default</h2>
      <p>
        No custom class or style; this is the built-in SimpleTable appearance.
      </p>
      <button type="button" onClick={() => setActivity(createActivity())}>
        Randomize data
      </button>
      <SimpleTable
        columns={columns}
        rows={activity()}
        aria-label="Default recent account activity"
        maxHeight="13rem"
        getRowKey={(entry) => entry.id}
      />
    </section>
  );
}
