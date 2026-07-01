export default function Divider() {
    return (
        <div className="flex items-center">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            <span className="mx-4 text-zinc-400 dark:text-zinc-500 text-xs font-bold tracking-wider">
                OR
            </span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>
    );
}