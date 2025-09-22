import PostsModal from "./PostsModal";
import ClientsModal from "./ClientsModal";
import CustomizationModal from "./CustomizationModal";

interface ModalsManagerProps {
  showPostsModal: boolean;
  showClientsModal: boolean;
  showCustomization: boolean;
  showThemeModal: boolean;
  userId?: string;
  shopId: string;
  userRole?: string;
  onClosePostsModal: () => void;
  onCloseClientsModal: () => void;
  onCloseCustomizationModal: () => void;
  onPostDeleted?: () => void;
}

export default function ModalsManager({
  showPostsModal,
  showClientsModal,
  showCustomization,
  showThemeModal,
  userId,
  shopId,
  userRole,
  onClosePostsModal,
  onCloseClientsModal,
  onCloseCustomizationModal,
  onPostDeleted,
}: ModalsManagerProps) {
  return (
    <>
      <PostsModal
        isOpen={showPostsModal}
        onClose={onClosePostsModal}
        userId={userId}
        shopId={shopId}
        userRole={userRole}
        onPostDeleted={onPostDeleted}
      />

      <ClientsModal
        isOpen={showClientsModal}
        onClose={onCloseClientsModal}
        userId={userId}
        shopId={shopId}
        userRole={userRole}
      />

      <CustomizationModal
        isOpen={showCustomization || showThemeModal}
        onClose={onCloseCustomizationModal}
        userId={userId}
      />
    </>
  );
}