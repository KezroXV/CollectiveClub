import Image from "next/image";
import PollDisplay from "@/components/PollDisplay";
import { useTheme } from "@/contexts/ThemeContext";

interface PostContentProps {
  content: string;
  imageUrl?: string;
  title: string;
  poll?: {
    id: string;
    question: string;
    options: Array<{
      id: string;
      text: string;
      votes: number;
    }>;
  };
  currentUser: {
    id: string;
    name: string;
    shopId: string;
  } | null;
}

const PostContent = ({
  content,
  imageUrl,
  title,
  poll,
  currentUser,
}: PostContentProps) => {
  const { colors } = useTheme();

  return (
    <>
      {/* Post Image */}
      {imageUrl && (
        <div className="mb-6">
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: `1px solid ${colors.Bordures}` }}
          >
            <Image
              src={imageUrl}
              alt={title}
              width={702}
              height={285}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      )}
      {/* Post Content */}
      <div className="prose max-w-none mb-6">
        <p
          className="text-[13px] leading-relaxed whitespace-pre-wrap"
          style={{ color: colors.Police }}
        >
          {content}
        </p>
      </div>

      {/* Poll Display */}
      {poll && (
        <div
          className="mb-6 p-4 rounded-xl"
          style={{
            backgroundColor: colors.Fond,
            border: `1px solid ${colors.Bordures}`
          }}
        >
          <PollDisplay
            poll={poll}
            currentUser={currentUser}
            onVote={() => window.location.reload()}
          />
        </div>
      )}
    </>
  );
};

export default PostContent;
