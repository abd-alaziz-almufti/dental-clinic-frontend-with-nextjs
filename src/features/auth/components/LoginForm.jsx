"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema } from "../schemas/loginSchema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const tAuth = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const { login } = useAuth();
  const router = useRouter();
  const [globalError, setGlobalError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setGlobalError(null);
    const result = await login(data.email, data.password);

    if (result.success) {
      router.push("/dashboard");
    } else {
      // Map error_code to translation or fallback message
      const errKey = result.errorCode ? result.errorCode.toLowerCase() : "unauthenticated";
      try {
        setGlobalError(tErrors(errKey));
      } catch (e) {
        setGlobalError(result.message || tAuth("invalidCredentials"));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {globalError && (
        <div
          role="alert"
          className="p-3 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200 font-medium"
        >
          {globalError}
        </div>
      )}

      <Input
        label={tAuth("emailLabel")}
        placeholder={tAuth("emailPlaceholder")}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label={tAuth("passwordLabel")}
        placeholder={tAuth("passwordPlaceholder")}
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            {...register("rememberMe")}
          />
          {tAuth("rememberMe")}
        </label>
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-lg shadow-sm"
      >
        {isSubmitting ? tAuth("signingIn") : tAuth("signIn")}
      </Button>
    </form>
  );
}
