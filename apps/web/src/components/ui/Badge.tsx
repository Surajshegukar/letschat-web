interface Props {
    children: React.ReactNode;
}

export default function Badge({
    children,
}: Props) {
    return (
        <span className="px-3 py-1 rounded-full bg-[#19E68C]/10 text-emerald-600 dark:text-[#19E68C] text-xs font-semibold">
            {children}
        </span>
    );
}