import {
    ShieldCheck,
    Zap,
    Users,
    Cloud
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const features = [
    {
        icon: Zap,
        title: "Real-time Messaging",
        desc: "Instant conversations with lightning-fast delivery.",
    },
    {
        icon: ShieldCheck,
        title: "Secure & Private",
        desc: "End-to-end encrypted messaging.",
    },
    {
        icon: Users,
        title: "Groups & Channels",
        desc: "Collaborate with your team effortlessly.",
    },
    {
        icon: Cloud,
        title: "Cloud Sync",
        desc: "Access chats from anywhere.",
    },
];

export default function BrandingPanel() {
    return (
        <section className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#09090B] via-[#0B132B] to-[#0A1A2F] p-14 text-white">

            {/* Glowing background circles matching project colors */}
            <div className="absolute top-20 right-20 w-80 h-80 rounded-full bg-[#00C9FF]/10 blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#19E68C]/10 blur-[140px]" />

            <div className="relative z-10">

                <div className="flex items-center gap-3 mb-10">
                    <BrandLogo size={45} />
                    <h2 className="text-2xl font-bold tracking-tight">
                        Let's Chat
                    </h2>
                </div>

                <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
                    Welcome back
                    <br />
                    to{" "}
                    <span className="bg-gradient-to-r from-[#00C9FF] to-[#19E68C] bg-clip-text text-transparent">
                        Let's Chat
                    </span>
                </h1>

                <p className="mt-4 text-base text-zinc-300 max-w-lg leading-7">
                    Sign in to continue your conversations with your friends,
                    teams, and communities.
                </p>

                <div className="mt-16 space-y-8">
                    {features.map((item) => (
                        <div
                            key={item.title}
                            className="flex gap-5 items-start"
                        >
                            <div className="rounded-xl bg-[#00C9FF]/10 p-3 text-[#00C9FF] border border-[#00C9FF]/20">
                                <item.icon size={22} />
                            </div>

                            <div>
                                <h3 className="font-semibold text-base text-zinc-150">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-zinc-400 mt-1">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}