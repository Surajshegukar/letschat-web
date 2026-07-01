import BrandingPanel from "@/components/auth/BrandingPanel";
import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
    return (
        <main className="min-h-screen grid lg:grid-cols-1 bg-white dark:bg-zinc-950">
            {/* <BrandingPanel /> */}
            <SignInForm />
        </main>
    );
}