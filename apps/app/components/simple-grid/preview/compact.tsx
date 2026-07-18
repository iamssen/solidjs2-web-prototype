import type { Element } from 'solid-js';
import type { SimpleTableColumn } from '../index.ts';
import { SimpleTable } from '../index.ts';
import styles from './compact.module.css';

type Activity = {
  time: string;
  event: string;
  actor: string;
  source: string;
  ipAddress: string;
  result: string;
};

const activity: readonly Activity[] = Array.from({ length: 60 }, (_, index) => {
  const minutes = 9 * 60 + 41 - index * 7;
  const hour = Math.floor(minutes / 60);

  return {
    time: `${String(hour).padStart(2, '0')}:${String(minutes % 60).padStart(
      2,
      '0',
    )}`,
    event: [
      'Invoice exported',
      'Member invited',
      'Report shared',
      'API key rotated',
    ][index % 4],
    actor: ['Ari Kim', 'Mina Park', 'Jun Lee', 'Sora Choi'][index % 4],
    source: ['Billing', 'Workspace', 'Analytics', 'Developer'][index % 4],
    ipAddress: `192.168.20.${(index % 240) + 10}`,
    result: index % 8 === 0 ? 'Needs review' : 'Completed',
  };
});

const columns = [
  { id: 'time', cell: 'time', header: 'Time', minWidth: 80 },
  { id: 'event', cell: 'event', header: 'Event', minWidth: 210 },
  { id: 'actor', cell: 'actor', header: 'Actor', minWidth: 140 },
  { id: 'source', cell: 'source', header: 'Source', minWidth: 130 },
  { id: 'ipAddress', cell: 'ipAddress', header: 'IP address', minWidth: 140 },
  { id: 'result', cell: 'result', header: 'Result', minWidth: 130 },
] as const satisfies readonly SimpleTableColumn<Activity>[];

export function CompactPreview(): Element {
  return (
    <section class={styles.example}>
      <h2>Compact activity</h2>
      <p>
        60 high-density rows for timelines, logs, and supporting information.
      </p>
      <SimpleTable
        class={styles.table}
        viewportClass={styles.viewport}
        columns={columns}
        rows={activity}
        aria-label="Recent account activity"
        maxHeight="13rem"
        getRowKey={(entry) => `${entry.time}-${entry.event}`}
      />
    </section>
  );
}
