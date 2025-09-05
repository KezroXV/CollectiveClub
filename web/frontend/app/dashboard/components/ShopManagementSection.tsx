import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CategoriesSection from "@/components/CategoriesSection";
import RolesMembersModal from "./RolesMembersModal";

interface ShopManagementSectionProps {
  userId?: string;
  shopId: string;
  onThemeClick: () => void;
}

export default function ShopManagementSection({
  userId,
  shopId,
  onThemeClick,
}: ShopManagementSectionProps) {
  return (
    <div className="col-span-4">
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-[18px] font-semibold text-gray-900 mb-6">
            Gestion de la boutique
          </h3>

          <div className="space-y-6">
            <div className="space-y-3">
              <RolesMembersModal
                variant="inline"
                isOpen={true}
                onClose={() => {}}
                userId={userId}
                shopId={shopId}
              />
            </div>

            <div className="border-t border-gray-200"></div>

            <div className="space-y-3">
              <CategoriesSection variant="inline" />
            </div>

            <div className="border-t border-gray-200"></div>

            <div className="space-y-3">
              <h4 className="text-[18px] font-medium text-gray-800">
                Personnalisation
              </h4>
              <p className="text-[12px] text-gray-600">
                Personnalisez l&apos;apparence et le thème de votre forum
              </p>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:shadow-md"
                onClick={onThemeClick}
              >
                🎨 Personnaliser le thème
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}