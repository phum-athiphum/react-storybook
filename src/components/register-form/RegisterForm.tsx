import { useRef, useState } from "react";
import axios from "axios";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email({ error: "Email is invalid" }).min(1, "Email is required"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d{10}$/, "Invalid phone number, should be 10 digits"),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type FormErrors = Partial<Record<keyof RegisterFormData, string>>;

export default function RegisterForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.currentTarget));
    const result = registerSchema.safeParse(formData);

    if (result.success) {
      setErrors({});
      try {
        const response = await axios.post(
          "https://65a25d5342ecd7d7f0a771bd.mockapi.io/users",
          result.data,
        );
        if (!response.data) throw new Error("Error in form submission");
        alert("Register successful!");
        formRef.current?.reset();
      } catch (error) {
        console.log("error", error);
        alert("Register fail!");
      }
    } else {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof RegisterFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
    }
  };

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} className="mx-auto my-8 max-w-sm">
        <h1 className="mb-2 text-3xl">Register Form</h1>
        <div className="mb-6">
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-white">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            data-testid="name"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>
        <div className="mb-6">
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-white">
            Email
          </label>
          <input
            type="text"
            id="email"
            name="email"
            data-testid="email"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>
        <div className="mb-6">
          <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-white">
            Phone Number
          </label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            data-testid="phoneNumber"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber}</p>}
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
        >
          Submit
        </button>
      </form>
    </>
  );
}
