import User from "../module/V1/models/userModel";

export const FormatActivities = async (
  activities: any | any[], // can be single or array
  currentUserId: string
) => {
  // Normalize to array
  const activityList = Array.isArray(activities) ? activities : [activities];

  const actorIds = [
    ...new Set(activityList.map((a: any) => a.actor.toString())),
  ];

  const users = await User.find({ _id: { $in: actorIds } }).lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const formatted = activityList.map((activity: any) => {
    const actorId = activity.actor.toString();
    const user = userMap.get(actorId);

    const actorName =
      actorId === currentUserId
        ? "You"
        : (user?.firstName as string) || "Unknown User";

    let message = "";
    switch (activity.type) {
      case "comment_added":
        message = `${actorName} added a comment on page`;
        break;
      case "comment_tagged":
        message = `${actorName} tagged someone in a comment`;
        break;
      case "highlight_added":
        message = `${actorName} added a highlight on page`;
        break;
      case "underline_added":
        message = `${actorName} added an underline on page`;
        break;
      case "file_renamed":
        message = `${actorName} renamed the file`;
        break;
      case "user_joined":
        message = `${actorName} joined the file`;
        break;
      default:
        message = `${actorName} performed an action`;
    }

    return {
      id: activity._id,
      actor: actorName,
      fileId: activity.fileId,
      type: activity.type,
      visibility: activity.visibility,
      annotationId: activity.others?.annotationId || null,
      createdAt: activity.createdAt,
      message,
    };
  });

  // Return single object if input was single
  return Array.isArray(activities) ? formatted : formatted[0];
};
