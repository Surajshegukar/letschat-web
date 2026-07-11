export const systemMessages = {
  groupCreated: (creatorName: string) => `${creatorName} created the group`,
  memberAdded: (adminName: string, memberNames: string[]) => `${adminName} added ${memberNames.join(", ")}`,
  memberRemoved: (adminName: string, memberName: string) => `${adminName} removed ${memberName}`,
  memberLeft: (memberName: string) => `${memberName} left the group`,
  groupNameChanged: (userName: string, newName: string) => `${userName} changed the group name to "${newName}"`,
  groupDescriptionChanged: (userName: string) => `${userName} changed the group description`,
  groupAvatarChanged: (userName: string) => `${userName} updated the group avatar`,
  madeAdmin: (adminName: string, userName: string) => `${adminName} made ${userName} an admin`,
};
