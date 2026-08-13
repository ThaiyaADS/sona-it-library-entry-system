import LoginForm from "@/components/LoginForm";
import { loginUser } from "@/actions/auth";

export const metadata = {
  title: "Student Login - Sona IT Library",
};

export default function StudentLoginPage() {
  const loginAction = async (formData: FormData) => {
    "use server";
    return await loginUser(formData, "STUDENT");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <LoginForm 
        title="Student Login" 
        description="Enter your admission number to access your dashboard"
        identifierLabel="Admission Number"
        identifierName="identifier"
        action={loginAction}
      />
    </div>
  );
}
