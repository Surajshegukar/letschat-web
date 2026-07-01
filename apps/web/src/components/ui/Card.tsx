import React from "react";
import clsx from "clsx";

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export default function Card({
    children,
    className,
}: CardProps) {
    return (
        <div
            className={clsx(
                "rounded-3xl border bg-white shadow-xl",
                className
            )}
        >
            {children}
        </div>
    );
}