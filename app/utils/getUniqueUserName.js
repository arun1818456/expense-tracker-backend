import User from "../modules/user/model.js";

export const getUniqueName = async (name) => {
  let baseUserName = name
    .trim()
    .split(" ")[0]
    .toLowerCase();

  let userName = baseUserName;
  let existingUser = await User.findOne({ userName });
  while (existingUser) {
    const randomNum = Math.floor(Math.random() * 5) + 1;
    userName = `${baseUserName}${randomNum}`;
    existingUser = await User.findOne({ userName });
  }
  return userName;
};