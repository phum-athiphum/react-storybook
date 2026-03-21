import type { Meta, StoryObj } from "@storybook/react";
import RegisterForm from "./RegisterForm";
import { within, userEvent, expect } from "storybook/test";
import { http, HttpResponse } from "msw";

const meta = {
  title: "RegisterForm",
  component: RegisterForm,
  tags: ["autodocs"],
  parameters: {
    msw: {
      handlers: [
        http.post("https://65a25d5342ecd7d7f0a771bd.mockapi.io/users", () => {
          return HttpResponse.json({ message: "Register successful!" }, { status: 200 });
        }),
      ],
    },
  },
} satisfies Meta<typeof RegisterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FilledState: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByTestId("name"), "John Doe", { delay: 100 });
    await userEvent.type(canvas.getByTestId("email"), "johndoe@example.com", {
      delay: 100,
    });
    await userEvent.type(canvas.getByTestId("phoneNumber"), "1234567890", {
      delay: 100,
    });
  },
};

export const ErrorState: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByTestId("email"), "invalid-email", {
      delay: 100,
    });
    await userEvent.click(canvas.getByText("Submit"));

    await expect(canvas.getByText("Email is invalid")).toBeInTheDocument();
    await expect(canvas.getByText("Name is required")).toBeInTheDocument();
    await expect(canvas.getByText("Phone number is required")).toBeInTheDocument();
  },
};

export const SuccessSubmit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByTestId("name"), "John Doe");
    await userEvent.type(canvas.getByTestId("email"), "johndoe@example.com");
    await userEvent.type(canvas.getByTestId("phoneNumber"), "1234567890");

    userEvent.click(canvas.getByText("Submit"));
  },
};
