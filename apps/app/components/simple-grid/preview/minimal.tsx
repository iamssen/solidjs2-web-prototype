import type { Element } from 'solid-js';
import { SimpleTable } from '../index.ts';
import type { SimpleTableColumn } from '../index.ts';
import styles from './minimal.module.css';

type Member = {
  name: string;
  team: string;
  role: string;
  location: string;
  email: string;
  availability: string;
};

const members: readonly Member[] = Array.from({ length: 60 }, (_, index) => {
  const memberNumber = index + 1;

  return {
    name: `Member ${String(memberNumber).padStart(2, '0')}`,
    team: ['Platform', 'Design systems', 'Data'][index % 3],
    role: ['Frontend engineer', 'Product designer', 'Data engineer'][index % 3],
    location: ['Seoul', 'Busan', 'Incheon', 'Daejeon'][index % 4],
    email: `member${memberNumber}@example.com`,
    availability: ['Available', 'Focus time', 'Out of office'][index % 3],
  };
});

const columns = [
  { id: 'name', cell: 'name', header: 'Name', minWidth: 140 },
  { id: 'team', cell: 'team', header: 'Team', minWidth: 150 },
  { id: 'role', cell: 'role', header: 'Role', minWidth: 180 },
  { id: 'location', cell: 'location', header: 'Location', minWidth: 130 },
  { id: 'email', cell: 'email', header: 'Email', minWidth: 220 },
  {
    id: 'availability',
    cell: 'availability',
    header: 'Availability',
    minWidth: 130,
  },
] as const satisfies readonly SimpleTableColumn<Member>[];

export function MinimalPreview(): Element {
  return (
    <section class={styles.example}>
      <h2 id="minimal-table-heading">Minimal</h2>
      <p>
        A small, clean table with no visible grid lines and 60 team members.
      </p>
      <SimpleTable
        id="minimal-team-directory"
        data-preview="minimal"
        aria-labelledby="minimal-table-heading"
        class={styles.table}
        viewportClass={styles.viewport}
        columns={columns}
        rows={members}
        maxHeight="12rem"
        getRowKey={(member) => member.name}
      />
    </section>
  );
}
