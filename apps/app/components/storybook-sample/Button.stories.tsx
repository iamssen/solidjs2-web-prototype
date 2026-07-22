import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { Button } from './Button.tsx';

const meta: Meta = {
  component: Button,
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { label: 'Button', children: 'TestButton' },
};
