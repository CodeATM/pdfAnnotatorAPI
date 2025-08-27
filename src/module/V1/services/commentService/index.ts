import User from "../../models/userModel";
import { Comment } from "../../models/commentModel";
import PdfModel from "../../models/PdfModel";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../../middlewares/error.middleware";
import { createActivity } from "../activityService";

const mentionRegex = /@([a-zA-Z0-9_]+)/g;

export const createCommentService = async ({
  content,
  authorId,
  fileId,
  parentCommentId,
  position,
  pageNumber,
}: {
  content: string;
  authorId: any;
  fileId: any;
  parentCommentId?: string;
  position: { x: number; y: number };
  pageNumber: number;
}) => {
  const file = await PdfModel.findOne({ fileId });
  if (!file) {
    throw new NotFoundError("File not found");
  }

  const taggedUsernames = Array.from(
    new Set(
      [...content.matchAll(mentionRegex)].map((match) => match[1].toLowerCase())
    )
  );

  const taggedUsers = await User.find({
    username: { $in: taggedUsernames },
  });

  if (taggedUsernames.length !== taggedUsers.length) {
    const foundUsernames = taggedUsers.map((u) => u.username);
    const missing = taggedUsernames.filter((u) => !foundUsernames.includes(u));
    throw new BadRequestError(
      `Mentioned users not found: ${missing.join(", ")}`
    );
  }

  let parentId = undefined;
  if (parentCommentId) {
    const parent = await Comment.findOne({ commentId: parentCommentId });
    if (!parent) throw new NotFoundError("Parent comment not found");
    parentId = parent._id;
  }

  const commentId = await generateUniqueCommentId();

  const newComment = await Comment.create({
    content,
    author: authorId,
    parentId: parentId || null,
    fileId: file._id,
    commentId,
    taggedUsers: taggedUsers.map((u) => u._id),
    position,
    pageNumber,
  });

  if (parentId) {
    await Comment.findByIdAndUpdate(parentId, {
      $push: { replies: newComment._id },
    });
  }

  const populatedComment = await Comment.findById(newComment._id)
    .populate({
      path: "author",
      select: "firstName lastName username avatar email",
    })
    .populate({
      path: "taggedUsers",
      select: "firstName lastName username avatar email",
    })
    .populate({
      path: "parentId",
      select: "content",
    });

  const activity = await createActivity({
    payload: {
      actor: authorId,
      fileId: fileId,
      type: "comment_added",
      others: {
        message: `added a comment on page`,
        annotationId: newComment._id,
      },
    },
  });

  return populatedComment;
};

export const getCommentByIdService = async (commentId: string) => {
  const comment = await Comment.findOne({ commentId })
    .populate({
      path: "author",
      select: "firstName lastName username avatar email",
    })
    .populate({
      path: "replies",
      select: "content commentId createdAt",
      options: { sort: { createdAt: 1 } },
      populate: {
        path: "author",
        select: "firstName lastName username avatar email",
      },
    })
    .populate({
      path: "parentId",
      select: "content commentId createdAt",
    });

  if (!comment) throw new NotFoundError("Comment not found");
  return comment;
};

export const deleteCommentService = async ({
  commentId,
  author,
}: {
  commentId: string;
  author: any;
}) => {
  const comment = await Comment.findOne({ commentId });
  if (!comment) throw new NotFoundError("Comment not found");

  if (comment.author.toString() !== author.toString()) {
    throw new ForbiddenError("You are not the owner of this comment");
  }

  // Step 1: Recursive function to collect all nested reply _ids
  const collectReplyIds = async (parentId: any): Promise<any[]> => {
    const directReplies = await Comment.find({ parentId }, { _id: 1 });
    if (directReplies.length === 0) return [];

    const nestedIds = await Promise.all(
      directReplies.map((reply) => collectReplyIds(reply._id))
    );

    return [...directReplies.map((r) => r._id), ...nestedIds.flat()];
  };

  // Step 2: Get all nested reply ids
  const allReplyIds = await collectReplyIds(comment._id);

  // Step 3: Delete all replies and the main comment
  await Comment.deleteMany({ _id: { $in: allReplyIds } });
  await Comment.deleteOne({ _id: comment._id });

  return;
};

// export const getThreadComments = async (threadId: string) => {
//   return Comment.find({ threadId, deleted: false })
//     .sort({ createdAt: 1 })
//     .populate("author taggedUsers parentComment");
// };

async function generateUniqueCommentId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 7;

  let commentId;
  let isUnique = false;

  while (!isUnique) {
    // Generate a random comment ID
    commentId = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      commentId += characters[randomIndex];
    }

    // Check if it already exists in the database
    const existingCode = await Comment.findOne({ commentId }).exec();
    if (!existingCode) {
      isUnique = true;
    }
  }

  return commentId;
}
