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
    <div className="dark min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex items-center justify-center py-12 px-4 relative overflow-y-auto overflow-x-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-950/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-950/20 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10 relative">
        <LoginForm 
          title="Faculty Login" 
          description="Enter your Faculty ID or registered email to access your faculty dashboard."
          identifierLabel="Faculty ID / Email"
          identifierName="identifier"
          action={loginAction}
        />
      </div>
    </div>
  );
}
