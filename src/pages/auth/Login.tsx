import { useForm } from "react-hook-form";
import { useEffect } from "react";
import InputField from "@/components/form/InputField";
import { Button } from "@/components/ui/button";
import type { SignInFormData } from "@/types/models";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";

const Login = () => {
  const navigate = useNavigate();
  const { user, signIn, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  useEffect(() => {
    if (!user || authLoading || profileLoading) return;

    const role = profile?.role;
    if (role === "admin" || role === "superAdmin") {
      navigate("/admin", { replace: true });
    } else if (role === "customer" || role === "employee") {
      navigate("/", { replace: true });
    }
  }, [user, profile, authLoading, profileLoading, navigate]);

  const onSubmit = async (data: SignInFormData) => {
    try {
      await signIn(data.email, data.password);

      toast.success("Successfully logged in");
      // navigate("/admin");
      // return;
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      <h2 className="form-title">Login Page</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          label="email"
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
              value: 6,
              message: "Password must be at least 6 characters",
            },
          }}
        />
        <Button type="submit">Login</Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{" "}
        <Link
          to="/sign-up"
          className="font-semibold text-blue-600 hover:underline"
        >
          Register here
        </Link>
      </p>
    </div>
  );
};

export default Login;
