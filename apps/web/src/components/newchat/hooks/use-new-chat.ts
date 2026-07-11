import { useState, useEffect, useMemo } from "react";
import { useSearchUsers } from "@/hooks/api/use-user";
import { useCreateConversation } from "@/hooks/api/use-conversations";
import { useAuthStore } from "@/store/auth-store";
import { useRealtimeStore } from "@/store/realtime-store";
import { useSocket } from "@/providers/socket-provider";
import { toast } from "sonner";

export function useNewChat(onSelectRoom: (roomId: string) => void) {
    const currentUser = useAuthStore((state) => state.user);
    const { isConnected } = useSocket();
    const onlineUsers = useRealtimeStore((state) => state.onlineUsers);
    
    const [view, setView] = useState<"menu" | "group_create">("menu");
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchTerm);
        }, 250);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    const { data: usersResponse, isLoading: isLoadingUsers } = useSearchUsers(debouncedQuery);
    const createConvMutation = useCreateConversation();

    const handleSelectUser = (targetUserId: string) => {
        if (targetUserId === currentUser?.id) {
            toast.info("Messaging yourself is not supported on the backend yet.");
            return;
        }

        createConvMutation.mutate(
            {
                type: "direct",
                participantIds: [targetUserId],
            },
            {
                onSuccess: (response) => {
                    const newRoomId = response.data?.conversation?._id;
                    if (newRoomId) {
                        onSelectRoom(newRoomId);
                    }
                },
            }
        );
    };

    const handleToggleSelectForGroup = (userId: string) => {
        setSelectedUserIds((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });
    };

    const handleCreateGroup = () => {
        if (!groupName.trim()) {
            toast.error("Please enter a group name.");
            return;
        }
        if (selectedUserIds.size === 0) {
            toast.error("Please select at least one contact to join the group.");
            return;
        }

        createConvMutation.mutate(
            {
                type: "group",
                name: groupName.trim(),
                description: groupDescription.trim() || undefined,
                participantIds: Array.from(selectedUserIds),
            },
            {
                onSuccess: (response) => {
                    const newRoomId = response.data?.conversation?._id;
                    if (newRoomId) {
                        toast.success("Group created successfully!");
                        onSelectRoom(newRoomId);
                        setView("menu");
                        setGroupName("");
                        setGroupDescription("");
                        setSelectedUserIds(new Set());
                    }
                },
            }
        );
    };

    const usersList = usersResponse?.data?.users || [];

    // Group contacts alphabetically
    const groupedContacts = useMemo(() => {
        const groups: Record<string, any[]> = {};

        usersList.forEach((user: any) => {
            if (user._id === currentUser?.id) return;

            const name = user.displayName || user.username || "";
            let firstLetter = name.charAt(0).toUpperCase();

            if (!/^[A-Z]$/.test(firstLetter)) {
                firstLetter = "#";
            }

            if (!groups[firstLetter]) {
                groups[firstLetter] = [];
            }
            groups[firstLetter]!.push(user);
        });

        const sortedKeys = Object.keys(groups).sort((a, b) => {
            if (a === "#") return -1;
            if (b === "#") return 1;
            return a.localeCompare(b);
        });

        const sortedGroups: Array<{ key: string; contacts: any[] }> = [];
        sortedKeys.forEach((key) => {
            const groupList = groups[key] || [];
            groupList.sort((c1, c2) => {
                const n1 = c1.displayName || c1.username || "";
                const n2 = c2.displayName || c2.username || "";
                return n1.localeCompare(n2);
            });
            sortedGroups.push({ key, contacts: groupList });
        });

        return sortedGroups;
    }, [usersList, currentUser]);

    const selectedUsers = useMemo(() => {
        return usersList.filter((u: any) => selectedUserIds.has(u._id));
    }, [usersList, selectedUserIds]);

    return {
        currentUser,
        isConnected,
        onlineUsers,
        view,
        setView,
        groupName,
        setGroupName,
        groupDescription,
        setGroupDescription,
        selectedUserIds,
        setSelectedUserIds,
        searchTerm,
        setSearchTerm,
        isLoadingUsers,
        usersList,
        groupedContacts,
        selectedUsers,
        handleSelectUser,
        handleToggleSelectForGroup,
        handleCreateGroup,
        isCreatingConversation: createConvMutation.isPending,
    };
}
