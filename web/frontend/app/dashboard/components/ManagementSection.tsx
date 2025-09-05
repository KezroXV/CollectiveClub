import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Users, Home, Palette } from "lucide-react";

interface ManagementSectionProps {
  onClientsClick: () => void;
  onPostsClick: () => void;
  onThemeClick: () => void;
}

export default function ManagementSection({
  onClientsClick,
  onPostsClick,
  onThemeClick,
}: ManagementSectionProps) {
  return (
    <div className="col-span-8 space-y-6">
      <Card className="hover:shadow-sm border-chart-4">
        <CardContent className="">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gérer</h3>
          <nav className="space-y-1">
            <Button
              variant="ghost"
              onClick={onClientsClick}
              className="w-full text-md justify-start h-16  py-5 text-gray-600 bg-chart-6 border-chart-4 mb-4 border"
              icon={<Users className="h-4 w-4" />}
            >
              Clients
            </Button>
            <Button
              variant="ghost"
              onClick={onPostsClick}
              className="w-full text-md justify-start h-16  py-5 text-gray-600 bg-chart-6 border-chart-4 mb-4 border"
              icon={<FileText className="h-4 w-4" />}
            >
              Posts
            </Button>
            <Button
              variant="ghost"
              onClick={onThemeClick}
              className="w-full text-md justify-start h-16  py-5 text-gray-600 bg-chart-6 border-chart-4  border"
              icon={<Palette className="h-4 w-4" />}
            >
              Thème
            </Button>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}
