"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface UserInfoCardProps {
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

export default function UserInfoCard({ user }: UserInfoCardProps) {
  const { colors } = useTheme();

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";
  };

  return (
    <Card
      className="mb-6 hover:shadow-sm border-0"
      style={{ backgroundColor: `${colors.Posts}08` }}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2" style={{ borderColor: colors.Posts }}>
              <AvatarImage src={user.image} />
              <AvatarFallback
                className="text-white font-semibold"
                style={{ backgroundColor: colors.Posts }}
              >
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold" style={{ color: colors.Police }}>
                Connecté en tant que {user.name}
              </p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            <User className="h-3 w-3 mr-1" />
            Membre actif
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
