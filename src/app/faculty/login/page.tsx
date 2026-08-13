import LoginForm from "@/components/LoginForm";
import { loginUser } from "@/actions/auth";

export const metadata = {
  title: "Faculty Login - Sona IT Library",
};

export default function FacultyLoginPage() {
  const loginAction = async (formData: FormData) => {
    "use server";
    return await loginUser(formData, "FACULTY");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <LoginForm 
        title="Faculty Login" 
        description="Enter your Faculty ID to access your dashboard"
        identifierLabel="Faculty ID / Email"
        identifierName="identifier"
        action={loginAction}
      />
    </div>
  );
}
