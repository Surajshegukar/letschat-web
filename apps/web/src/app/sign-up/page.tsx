import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
    return (
        <main className="min-h-screen grid grid-cols-1 bg-white dark:bg-zinc-950">
            <SignUpForm />
        </main>
    );
}
