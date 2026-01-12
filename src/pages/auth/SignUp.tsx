import InputField from "@/components/form/InputField";
import { useForm } from "react-hook-form";
import type { SignUpFormData } from "@/types/models";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
const SignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      country: "",
      phoneNumber: "",
      terms_agree: false,
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await signUp(data.email, data.password, data.fullName, data.country);

      toast.success("Check your email to confirm your account");
      navigate("/login");
      return;
    } catch (e) {
      console.error(e);
      toast.error("Sign up failed", {
        description:
          e instanceof Error ? e.message : "Failed to create an account.",
      });
    }
  };
  return (
    <>
      <h2 className="form-title">Sign up</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          label="Username"
          name="fullName"
          register={register}
          placeholder="Enter your username"
          error={errors.fullName}
          validation={{ required: "Full name is required" }}
        />
        <InputField
          label="Email"
          type="email"
          name="email"
          register={register}
          placeholder="Johndoe@gmail.com"
          error={errors.email}
          validation={{
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Invalid email address",
            },
          }}
        />
        <InputField
          label="Password"
          type="password"
          name="password"
          register={register}
          placeholder="Enter your password"
          error={errors.password}
          validation={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          }}
        />
        <InputField
          label="Country"
          name="country"
          register={register}
          placeholder="Enter your country"
          error={errors.country}
          validation={{ required: "Country is required" }}
        />
        <InputField
          label="Phone Number"
          name="phoneNumber"
          register={register}
          placeholder="Enter your phone number"
          error={errors.phoneNumber}
        />
        <div>
          <input
            type="checkbox"
            id="terms_agree"
            {...register("terms_agree", { required: true })}
          />
          <label htmlFor="terms_agree" className="ml-2 text-gray-400">
            I agree to the terms and conditions
          </label>
          {errors.terms_agree && (
            <p className="text-red-500">You must agree to the terms</p>
          )}
        </div>
        <Button type="submit">Sign Up</Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:underline"
        >
          login here
        </Link>
      </p>
    </>
  );
};

export default SignUp;
