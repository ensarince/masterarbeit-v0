import fs from "fs"
import path from "path"
import express from "express"
import bodyParser from "body-parser"
const express = require('express');

const router = express.Router();
router.use(bodyParser.json());

const directoryPath = './user_profiles/';

// Register route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Check if the user already exists
  const userProfilePath = path.join(userProfilesDir + `${username}.json`);
  try {
    await fs.access(userProfilePath);
    return res.status(400).json({ message: 'Username already exists' });
  } catch (error) {
    // User profile does not exist, create a profile
  }

  // User profile is created here
  // When changing that, look here
  const userProfile = { username, password };

  // Save user profile as a JSON file
  await fs.writeFile(userProfilePath, JSON.stringify(userProfile));


  // TODO Session creation
  res.status(201).json({ message: 'User registered successfully', user: userProfile });
});


// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const userProfilePath = path.join(directoryPath + `${username}.json`);

  try {
    const userProfileData = await fs.readFile(userProfilePath, 'utf8');
    const userProfile = JSON.parse(userProfileData);

    if (userProfile.password === password) {
      return res.json({ message: 'Login successful' });
    } else {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
});


module.exports = router;


// From here on just artifacts


  // return true if a username available, false if name exists already
  function checkUsernameAvailable(username) {
    
    fs.readdirSync(directoryPath).forEach((file) => {
      
      if (path.extname(file) === '.json') {
      
        const jsonData = JSON.parse(
          fs.readFileSync(directoryPath + '/' + file, 'utf-8'));
      
        if (jsonData.username === username) { 
          console.log(`Found file ${file} to match username and password`);  
          return false;
        }
      } else {
        // not a case that is expected to be reached
        console.log(`The file ${file} is not a .json file`)
      } 
    })
    return true;
  }

  // return the matching file for (username, password) or null
  function find_userProfile(username, password) {
    fs.readdirSync(directoryPath).forEach((file) => {
      
      if (path.extname(file) === '.json') {
      
        const jsonData = JSON.parse(
          fs.readFileSync(directoryPath + '/' + file, 'utf-8'));
      
        if (jsonData.username === username && jsonData.password === password) {
          console.log(`Found file ${file} to match username and password`);  
          return file;
        }
      } else {
        console.log(`The file ${file} is not a .json file`)
      } 
    })

    console.log("No matching file found for given username and password");
    return null;
  }
  

  // mainly for testing/playing around
  // print the file name of all user profiles
  function print_userProfiles() {
    fs.readdirSync(directoryPath).forEach((file) => {
      if (path.extname(file) === '.json') {
        const jsonData = JSON.parse(
          fs.readFileSync(directoryPath + '/' + file, 'utf-8'));
        console.log(jsonData.username, "is the username of file");
        console.log(`${file} :`, jsonData);
      } else {
        console.log(`The file ${file} is not a .json file`)
      } 
   })
  }
