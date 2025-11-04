
interface createCommentBody {
  content: string;
  authorName: string;
}

interface createPostBody {
  content: string;
  publish: boolean;
  title: string;
}

interface updatePostBody {
  content?: string;
  publish?: boolean;
  title?: string;
}

export type { createCommentBody, createPostBody, updatePostBody };
