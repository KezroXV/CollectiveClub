import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface PostHeaderProps {
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  createdAt: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  title: string;
  getInitials: (name: string) => string;
  formatDate: (dateString: string) => string;
  getRoleColor: (role: string) => string;
  getRoleLabel: (role: string) => string;
}

const PostHeader = ({
  author,
  createdAt,
  category,
  title,
  getInitials,
  formatDate,
  getRoleColor,
  getRoleLabel,
}: PostHeaderProps) => {
  return (
    <>
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author.avatar} />
            <AvatarFallback className="bg-blue-500 text-white font-semibold text-sm">
              {getInitials(author.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900 text-sm">
                {author.name}
              </p>
              <Badge
                className={`${getRoleColor(author.role)} text-xs px-2 py-1`}
                variant="secondary"
              >
                {getRoleLabel(author.role)}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              posté le {formatDate(createdAt)}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Categories badges */}
      <div className="flex gap-2 mb-4">
        {category && (
          <Badge
            variant="secondary"
            className="text-xs px-3 py-1 border-0"
            style={{
              backgroundColor: category.color,
              color: "white",
            }}
          >
            {category.name}
          </Badge>
        )}
      </div>

      {/* Post Title */}
      <h1 className="text-[13px] font-semibold text-gray-900 mb-4">
        {title}
      </h1>
    </>
  );
};

export default PostHeader;