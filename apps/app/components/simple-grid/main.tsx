import type { Element } from 'solid-js';
import { SimpleTable } from './index.ts';

type Member = {
  name: string;
  team: string;
  role: string;
  location: string;
  projects: number;
};

const members: readonly Member[] = Array.from({ length: 50 }, (_, index) => {
  const memberNumber = index + 1;

  return {
    name: `Member ${memberNumber}`,
    team: ['Platform', 'Design systems', 'Data'][index % 3],
    role: ['Frontend engineer', 'Product designer', 'Data engineer'][index % 3],
    location: ['Seoul', 'Busan', 'Incheon', 'Daejeon'][index % 4],
    projects: (index % 6) + 1,
  };
});

const columns = [
  { id: 'name', key: 'name', header: 'Name', minWidth: 140, maxWidth: 180 },
  { id: 'team', key: 'team', header: 'Team', minWidth: 150, maxWidth: 190 },
  { id: 'role', key: 'role', header: 'Role', minWidth: 180, maxWidth: 230 },
  {
    id: 'location',
    key: 'location',
    header: 'Location',
    minWidth: 120,
    maxWidth: 150,
  },
  {
    id: 'projects',
    key: 'projects',
    header: 'Projects',
    minWidth: 110,
    maxWidth: 130,
    align: 'end',
    cell: ({ row: member }: { row: Member }) => `${member.projects} active`,
  },
] as const;

export function SimpleTablePreview(): Element {
  return (
    <section>
      <h1>Simple table</h1>
      <p>
        Narrow the viewport to keep the first column visible while scrolling
        through the remaining columns.
      </p>
      <SimpleTable
        columns={columns}
        rows={members}
        ariaLabel="Team members"
        maxHeight="18rem"
        getRowKey={(member) => member.name}
      />
    </section>
  );
}
