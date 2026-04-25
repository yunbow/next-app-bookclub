import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserListItemProps {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    bio: string | null;
  };
}

export function UserListItem({ user }: UserListItemProps) {
  return (
    <Link
      href={`/users/${user.id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.image || undefined} />
        <AvatarFallback>
          {user.name?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{user.name || "名前未設定"}</p>
        {user.bio && (
          <p className="text-sm text-muted-foreground truncate">{user.bio}</p>
        )}
      </div>
    </Link>
  );
}
