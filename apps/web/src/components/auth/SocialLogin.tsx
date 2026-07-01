import { Button } from "@/components/ui";

export default function SocialLogin() {
    return (
        <div className="space-y-4">

            <Button
                variant="outline"
                className="w-full h-12"
            >
                Continue with Google
            </Button>

            <Button
                variant="outline"
                className="w-full h-12"
            >
                Continue with GitHub
            </Button>

        </div>
    );
}