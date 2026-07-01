import React from "react";

interface Props {
    checked?: boolean;
    onChange?: () => void;
}

export default function Checkbox({
    checked,
    onChange,
}: Props) {
    return (
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="w-5 h-5 accent-[#00C9FF] rounded cursor-pointer"
        />
    );
}