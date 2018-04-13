module.exports = class Helper {
  // sessionValidate(sessionID, fromID, onlineUserList) {
  //   if ((sessionID == fromID) && (onlineUserList.has(fromID)))
  //     return true;
  //   else
  //     return false;
  // }

  validUsers(validUserList, candidateList) {
    // check whether all the user in candidateList is valid
    for (let i = 0; i < candidateList.length; i++) {
      const tmpID = parseInt(candidateList[i]);
      if (tmpID != -1 && tmpID != 0) {
        if (!validUserList.has(tmpID)) {
          return false;
        }
      }
    }
    return true;
  }
};
