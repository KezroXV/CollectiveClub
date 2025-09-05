import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Users, Home } from "lucide-react";

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
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gérer</h3>
          <nav className="space-y-1">
            <button
              onClick={onClientsClick}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left"
            >
              <Users className="h-4 w-4 mr-3 transition-colors duration-200" />
              Clients
            </button>
            <button
              onClick={onPostsClick}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left"
            >
              <FileText className="h-4 w-4 mr-3 transition-colors duration-200" />
              Posts
            </button>
            <button
              onClick={onThemeClick}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left"
            >
              🎨 Thème
            </button>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}
