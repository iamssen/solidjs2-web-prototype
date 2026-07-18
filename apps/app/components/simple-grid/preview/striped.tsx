import type { Element } from 'solid-js';
import { createSignal } from 'solid-js';
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

const createProjects = (): readonly Project[] => {
  const seed = Math.floor(Math.random() * 10_000);

  return Array.from({ length: 60 }, (_, index) => {
    const projectNumber = index + 1;
    const value = index + seed;

    return {
      project: `${
        [
          'Billing migration',
          'Mobile navigation',
          'Usage dashboard',
          'Account recovery',
        ][value % 4]
      } ${String(projectNumber).padStart(2, '0')}`,
      owner: ['Ari Kim', 'Mina Park', 'Jun Lee', 'Sora Choi'][value % 4],
      status: ['On track', 'At risk', 'Planning'][
        value % 3
      ] as Project['status'],
      priority: ['High', 'Medium', 'Low'][value % 3] as Project['priority'],
      area: ['Billing', 'Navigation', 'Analytics', 'Accounts'][value % 4],
      due: `Sep ${String((value % 28) + 1).padStart(2, '0')}`,
    };
  });
};

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
  const [projects, setProjects] = createSignal(createProjects());

  return (
    <section class={styles.example}>
      <h2>Striped status list</h2>
      <p>60 alternating project rows with compact status tokens.</p>
      <button type="button" onClick={() => setProjects(createProjects())}>
        Randomize data
      </button>
      <SimpleTable
        class={styles.table}
        viewportClass={styles.viewport}
        columns={columns}
        rows={projects()}
        aria-label="Project status"
        maxHeight="14rem"
        getRowKey={(project) => project.project}
      />
    </section>
  );
}
