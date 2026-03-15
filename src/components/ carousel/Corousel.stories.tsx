import type { Meta, StoryObj } from "@storybook/react-vite";
import Carousel from "./Carousel";
import { within, userEvent, waitFor, expect } from "storybook/test";

const meta = {
  title: "Carousel",
  component: Carousel,
  tags: ["autodocs"],
  args: {
    images: [
      "https://fastly.picsum.photos/id/648/300/200.jpg?hmac=1CBWajz31GOLUdds_HpCDPaHDG6FF3eoY1fYcoFgEMY",
      "https://fastly.picsum.photos/id/69/300/200.jpg?hmac=eLc6u_j4wqI6rURIhekE0kS1oYHTmD7tNZ1LeEPyIeY",
      "https://fastly.picsum.photos/id/625/300/200.jpg?hmac=2JeYxbeay5cJXc4_CqXxaSVY6atO8yOJOZ9emIGYDf4",
    ],
    startIndex: 0,
    autoplay: false,
    interval: 3000,
  },
} satisfies Meta<typeof Carousel>


export default meta;

type Story = StoryObj<typeof meta>;

export const Basic : Story = {
  args: {
    autoplay: false,
  },
};

export const Autoplay: Story = {
  args: {
    autoplay: true,
    interval: 1000,
  },
};

export const CustomStartIndex: Story = {
  args: {
    startIndex: 1,
    autoplay: false,
  },
};

export const NextImageInteraction: Story = {
  args: {
    autoplay: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nextButton = canvas.getByText("Next");
    await userEvent.click(nextButton);

    await waitFor(async () => {
      await expect(canvas.getByAltText("Slide 1")).toBeInTheDocument();
    });
  },
};

export const PrevImageInteraction: Story = {
  args: {
    autoplay: false,
    startIndex: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prevButton = canvas.getByText("Previous");
    await userEvent.click(prevButton);

    await waitFor(async () => {
      // Replace this with the actual logic to verify the image change
      await expect(canvas.getByAltText("Slide 0")).toBeInTheDocument();
    });
  },
};