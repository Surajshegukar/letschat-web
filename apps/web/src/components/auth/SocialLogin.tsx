"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { GithubIcon, GoogleIcon } from "@/components/icons";
import { authService } from "@/services/auth-service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SocialLogin() {
    const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);

    const handleOAuthRedirect = async (provider: "google" | "github") => {
        try {
            setLoadingProvider(provider);
            const response = await authService.getOAuthUrl(provider);
            const url = response.data?.url;
            if (url) {
                window.location.href = url;
            } else {
                toast.error("Failed to generate login URL");
                setLoadingProvider(null);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to connect with ${provider}`);
            setLoadingProvider(null);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            
            <Button
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-2"
                onClick={() => handleOAuthRedirect("google")}
                disabled={loadingProvider !== null}
            >
                {loadingProvider === "google" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <GoogleIcon />
                )}
                Continue with Google
            </Button>

            <Button
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-2"
                onClick={() => handleOAuthRedirect("github")}
                disabled={loadingProvider !== null}
            >
                {loadingProvider === "github" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <GithubIcon />
                )}
                Continue with GitHub
            </Button>

        </div>
    );
}