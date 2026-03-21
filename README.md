# Storybook Learning Project

A hands-on project for learning **Storybook v10** with React + TypeScript + Vite.

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI Library |
| TypeScript | 5.9 | Type Safety |
| Vite | 8 | Build Tool |
| Storybook | 10 | Component Development & Testing |
| Tailwind CSS | 4 | Styling |
| Zod | 4 | Schema Validation |
| MSW | 2 | API Mocking |
| Axios | 1 | HTTP Client |

## Getting Started

```bash
# Install dependencies
npm install

# Run Storybook (opens at http://localhost:6006)
npm run storybook

# Run the React app
npm run dev
```

## Project Structure

```
src/
  components/
    modal/
      Modal.tsx                # Component
      Modal.stories.tsx        # Stories + Interaction Test
      modal.css                # Styles
    register-form/
      RegisterForm.tsx         # Component (Zod + Axios)
      RegisterForm.stories.tsx # Stories + MSW Mock + Interaction Test
    carousel/
      Carousel.tsx             # Component
      Corousel.stories.tsx     # Stories + Interaction Test
.storybook/
  main.ts                      # Storybook config
  preview.ts                   # Global decorators, loaders (MSW)
```

---

## What I Learned

### 1. Basic Story File Structure

Every story file follows the same 3-part structure:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import MyComponent from "./MyComponent";

// 1) Meta — central config for this story group
const meta = {
  title: "MyComponent",       // name shown in the sidebar
  component: MyComponent,     // the component to render
  tags: ["autodocs"],          // auto-generate a docs page
  args: { /* default props */ },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// 2) Each named export = one story (one state of the component)
export const Default: Story = {};

export const AnotherState: Story = {
  args: {
    // override props for this specific story
  },
};
```

**Key Concepts:**
- `Meta` — defines the shared config for a component (title, default args, decorators)
- `StoryObj` — the type for each individual story
- `satisfies Meta<typeof Component>` — provides type safety without widening the type
- `tags: ["autodocs"]` — Storybook auto-generates a documentation page from the props interface

---

### 2. Args — Passing Props via Storybook

`args` is how Storybook passes props to a component. There are two levels:

**Meta-level (defaults for all stories):**

```tsx
const meta = {
  args: {
    onClose: fn(),                    // mock function from storybook/test
    children: <p>Modal Content</p>,   // ReactNode is supported
  },
} satisfies Meta<typeof Modal>;
```

**Story-level (overrides for a specific story):**

```tsx
export const ClosedModal: Story = {
  args: { isOpen: false },
};

export const OpenModal: Story = {
  args: { isOpen: true },
};
```

Args defined this way appear as interactive **Controls** in the Storybook UI, allowing users to tweak values in real time.

---

### 3. Custom Render Function

Some components need external state management (e.g., a Modal that requires open/close buttons). Use the `render` function for this:

```tsx
const meta = {
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
```

Use `function Render(args)` instead of an arrow function because React requires a named function to use hooks.

---

### 4. Interaction Testing (play function)

Storybook lets you write interaction tests via the `play` function using APIs from `storybook/test`:

```tsx
import { within, userEvent, waitFor, expect } from "storybook/test";

export const InteractionTest: Story = {
  args: { isOpen: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Simulate a user click
    await userEvent.click(canvas.getByText("Open Modal"));

    // Assert that the content is visible
    await waitFor(() => {
      expect(canvas.getByText(/Modal Content/i)).toBeInTheDocument();
    });

    // Simulate closing
    await userEvent.click(canvas.getByLabelText("Close"));

    // Assert that the content is gone
    await waitFor(() => {
      expect(canvas.queryByText(/Modal Content/i)).not.toBeInTheDocument();
    });
  },
};
```

**Commonly Used APIs:**
| Function | Purpose |
|----------|---------|
| `within(canvasElement)` | Create a query scope from the story canvas |
| `userEvent.click(el)` | Simulate a click event |
| `userEvent.type(el, text)` | Simulate typing text into an input |
| `canvas.getByText("...")` | Find an element by its text content |
| `canvas.getByTestId("...")` | Find an element by its `data-testid` attribute |
| `canvas.getByLabelText("...")` | Find an element by its `aria-label` |
| `canvas.queryByText("...")` | Like `getByText` but returns `null` instead of throwing |
| `waitFor(() => ...)` | Wait until the assertion passes |
| `expect(el).toBeInTheDocument()` | Assert that an element exists in the DOM |
| `fn()` | Create a mock function |

---

### 5. MSW (Mock Service Worker) — Mocking APIs in Storybook

Use `msw-storybook-addon` to mock HTTP requests inside stories without hitting a real API.

**Setup (`.storybook/preview.ts`):**

```ts
import { initialize, mswLoader } from "msw-storybook-addon";

initialize();

const preview: Preview = {
  loaders: [mswLoader],
};
```

**Usage in a Story (`parameters.msw.handlers`):**

```tsx
import { http, HttpResponse } from "msw";

const meta = {
  title: "RegisterForm",
  component: RegisterForm,
  tags: ["autodocs"],
  parameters: {
    msw: {
      handlers: [
        http.post("https://example.com/api/users", () => {
          return HttpResponse.json(
            { message: "Register successful!" },
            { status: 200 }
          );
        }),
      ],
    },
  },
} satisfies Meta<typeof RegisterForm>;
```

This allows you to test form submissions inside Storybook with a fully mocked response.

---

### 6. Storybook Configuration

**`.storybook/main.ts`** — Main config:

```ts
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [],
  framework: "@storybook/react-vite",
  viteFinal: async (config) => {
    config.plugins = config.plugins ?? [];
    config.plugins.push(tailwindcss());
    return config;
  },
};
```

- `stories` — glob pattern that tells Storybook where to find story files
- `framework` — use `@storybook/react-vite` for React + Vite projects
- `viteFinal` — a hook to customize the Vite config (e.g., adding the Tailwind CSS plugin)

**`.storybook/preview.ts`** — Global settings:

- Import global CSS for all stories (e.g., `../src/index.css`)
- Set `controls.matchers` for auto-detecting control types
- Add `loaders` such as the MSW loader

---

### 7. Summary of Patterns Used in This Project

| Component | What I Learned |
|-----------|---------------|
| **Modal** | Custom render function, `useState` in stories, interaction test (open/close), `fn()` mock |
| **RegisterForm** | MSW mock API, form interaction test (`userEvent.type`), validation error assertion, multiple story states (Default, Filled, Error, Success) |
| **Carousel** | Args-based stories (autoplay, startIndex), interaction test for Next/Previous buttons, `waitFor` + `getByAltText` assertion |

---

## Resources

- [Storybook Docs](https://storybook.js.org/docs)
- [Storybook Interaction Testing](https://storybook.js.org/docs/writing-tests/interaction-testing)
- [MSW Storybook Addon](https://github.com/mswjs/msw-storybook-addon)
- [Storybook for React & Vite](https://storybook.js.org/docs/get-started/frameworks/react-vite)
