interface Props {
    src?: string;
}

export default function Avatar({
    src,
}: Props) {
    return (
        <img
            src={src || "/avatar.png"}
            className="w-10 h-10 rounded-full object-cover"
            alt="avatar"
        />
    );
}