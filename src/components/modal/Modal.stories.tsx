import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within, waitFor, expect, fn } from "storybook/test";
import Modal from "./Modal";

const meta = {
  title: "Modal",
  component: Modal,
  tags: ["autodocs"],
  // this args is the default for all stories in this file
  args: {
    onClose: fn(),
    children: <p>Modal Content</p>,
  },
  render: function Render(args) {
    const [isOpen, setIsOpen] = useState(args.isOpen);
    return (
      <div>
        <button onClick={() => setIsOpen(true)}>Open Modal</button>
        <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    );
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ClosedModal: Story = {
  args: {
    isOpen: false,
  },
};

export const OpenModal: Story = {
  args: {
    isOpen: true,
  },
};

export const InteractionTest: Story = {
  args: {
    isOpen: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText("Open Modal");
    await userEvent.click(openButton);

    await waitFor(() => {
      expect(canvas.getByText(/Modal Content/i)).toBeInTheDocument();
    });

    const closeButton = canvas.getByLabelText("Close");
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(canvas.queryByText(/Modal Content/i)).not.toBeInTheDocument();
    });
  },
};
