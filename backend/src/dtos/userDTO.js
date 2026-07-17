function toUserDTO(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt
  };
}

module.exports = { toUserDTO };
