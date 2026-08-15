import LoginForm from "@/components/LoginForm";
import { loginAdmin } from "@/actions/auth";

export const metadata = {
  title: "Admin Login - Sona IT Library",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const redirectVal = typeof resolvedSearchParams?.redirect === "string" ? resolvedSearchParams.redirect : undefined;

  const loginAction = async (formData: FormData) => {
    "use server";
    return await loginAdmin(formData, redirectVal);
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex items-center justify-center py-12 px-4 relative overflow-y-auto overflow-x-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-950/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-950/20 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10 relative">
         <LoginForm 
           title="Admin Login" 
           description="Authorized IT department operations personnel only."
           identifierLabel="Admin Username"
           identifierName="username"
           action={loginAction}
         />
      </div>
    </div>
  );
}
