import type { Meta, StoryObj } from '@storybook/react-vite'

import CodeBlock from './CodeBlock'

const codeBlockMeta = {
  component: CodeBlock,
} satisfies Meta<typeof CodeBlock>

export default codeBlockMeta

type Story = StoryObj<typeof codeBlockMeta>

export const Default: Story = {
  args: {
    children: 'console.log("Hello, World!");',
  },
};

export const WithCopyButton: Story = {
  args: {
    children: 'redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001',
    isCopyable: true,
  },
};
