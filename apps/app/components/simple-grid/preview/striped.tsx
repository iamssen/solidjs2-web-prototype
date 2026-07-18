import type { Element } from 'solid-js';
import { SimpleTable } from '../index.ts';
import type { SimpleTableColumn } from '../index.ts';
import styles from './striped.module.css';

type Project = {
  project: string;
  owner: string;
  status: 'On track' | 'At risk' | 'Planning';
  priority: 'High' | 'Medium' | 'Low';
  area: string;
  due: string;
};

const projects: readonly Project[] = Array.from({ length: 60 }, (_, index) => {
  const projectNumber = index + 1;

  return {
    project: `${
      [
        'Billing migration',
        'Mobile navigation',
        'Usage dashboard',
        'Account recovery',
      ][index % 4]
    } ${String(projectNumber).padStart(2, '0')}`,
    owner: ['Ari Kim', 'Mina Park', 'Jun Lee', 'Sora Choi'][index % 4],
    status: ['On track', 'At risk', 'Planning'][index % 3] as Project['status'],
    priority: ['High', 'Medium', 'Low'][index % 3] as Project['priority'],
    area: ['Billing', 'Navigation', 'Analytics', 'Accounts'][index % 4],
    due: `Sep ${String((index % 28) + 1).padStart(2, '0')}`,
  };
});

const columns = [
  { id: 'project', cell: 'project', header: 'Project', minWidth: 190 },
  { id: 'owner', cell: 'owner', header: 'Owner', minWidth: 150 },
  {
    id: 'status',
    header: 'Status',
    minWidth: 130,
    cell: (context: { row: Project }) => (
      <span class={[styles.status, styles[context.row.status]]}>
        {context.row.status}
      </span>
    ),
  },
  { id: 'priority', cell: 'priority', header: 'Priority', minWidth: 110 },
  { id: 'area', cell: 'area', header: 'Area', minWidth: 130 },
  {
    id: 'due',
    cell: 'due',
    header: 'Due date',
    minWidth: 120,
    headerClass: styles.end,
    cellClass: styles.end,
  },
] as const satisfies readonly SimpleTableColumn<Project>[];

export function StripedPreview(): Element {
  return (
    <section class={styles.example}>
      <h2>Striped status list</h2>
      <p>60 alternating project rows with compact status tokens.</p>
      <SimpleTable
        class={styles.table}
        viewportClass={styles.viewport}
        columns={columns}
        rows={projects}
        aria-label="Project status"
        maxHeight="14rem"
        getRowKey={(project) => project.project}
      />
    </section>
  );
}
