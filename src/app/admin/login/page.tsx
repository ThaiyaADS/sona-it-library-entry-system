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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
         <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Sona IT Library</h1>
            <p className="text-slate-400 mt-2">Administration Portal</p>
         </div>
         <LoginForm 
           title="Admin Login" 
           description="Authorized personnel only"
           identifierLabel="Admin Username"
           identifierName="username"
           action={loginAction}
         />
      </div>
    </div>
  );
}
