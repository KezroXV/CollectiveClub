import Image from "next/image";
import PollDisplay from "@/components/PollDisplay";

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
  return (
    <>
      {/* Post Image */}
      {imageUrl && (
        <div className="mb-6">
          <div className="rounded-xl overflow-hidden">
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
        <p className="text-gray-700 text-[13px] leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>

      {/* Poll Display */}
      {poll && (
        <div className="mb-6">
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
