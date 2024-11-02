import fs from "fs"

const sessionsDir = './sessions/';


// takes the username and the session data to be added
// overwrites duplicate fields of existing session and newSessionData
async function createOrUpdateSession(username, newSessionData) {
    const sessionFilePath = path.join(sessionsDir, `${username}.json`);
  
    try {
      // Read existing session data
      const existingSessionData = await getSessionData(username);
  
      // Merge existing and new session data, only overwriting duplicate fields
      const updatedSessionData = { ...existingSessionData, ...newSessionData };
  
      // Write the updated session data to the file
      await fs.writeFile(sessionFilePath, JSON.stringify(updatedSessionData));
      console.log(`Session updated for ${username}`);
    } catch (error) {
      console.error(`Error updating session for ${username}: ${error.message}`);
    }
}
  
async function getSessionData(username) {
  const sessionFilePath = path.join(sessionsDir, `${username}.json`);

  try {
    const sessionData = await fs.readFile(sessionFilePath, 'utf8');
    return JSON.parse(sessionData);
  } catch (error) {
    console.error(`Error reading session for ${username}: ${error.message}`);
    return null;
  }
}

module.exports = {
  createOrUpdateSession,
  getSessionData
};
