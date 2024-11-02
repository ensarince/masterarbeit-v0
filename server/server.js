import { config } from "dotenv";
import { OpenAI } from 'openai';
import cors from "cors"
import express from "express"
import bodyParser from "body-parser";

config()

const assistant_id = process.env.ASSISTANT_ID; 
const api_key = process.env.API_KEY; 

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const openai = new OpenAI({
    apiKey: process.env.API_KEY 
});

//my first method that I use now
app.post("/chatbot", async (req, res) => {
    const { question/* , behavior  */} = req.body;

    let systemMessage = "You are a helpful assistant."; 
  /*   if (behavior === "Rude") {
        systemMessage = "You are a very rude assistant, show them tough love.";
    } else if (behavior === "Kind") {
        systemMessage = "You are a very nice assistant, be kind.";
    }
 */
    try {
        const response = await openai.chat.completions.create({
            messages: [
            {
                role: "system",
                content: systemMessage,
            },
            {
                role: "user",
                content: question,
            },
            ],
            model: "gpt-4",
            max_tokens: 300,
        });
        
        res.send(response.choices[0].message.content);
    } catch (error) {
            console.error("Error during OpenAI API call", error);
        res.status(500).send("Internal Server Error");
    }
});

//! useful functions for later use
/* get the user session, call populate a thread(iplik)*/
async function getThreadID(username) {
    
    const sessionPath = path.join(`user_sessions/${username}_session.json`);

    try {
        // access session
        const sessionData = await fs.readFile(sessionPath, 'utf8');
        const sessionJson = JSON.parse(sessionData);

        let thread_id = sessionJson.thread_id;
        if (thread_id === undefined) {
        let thread = await openai.beta.threads.create();
        thread_id = thread.id;

        sessionJson.thread_id = thread_id;
        await fs.writeFile(sessionPath, JSON.stringify(sessionJson, null, 2), 'utf8');

        // populate thread with user profile and context
        await populateThread(thread_id, username);
    }
        return thread_id;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

/* main function -> call generateFeedbackPrompt(), call getThreadId() */
app.get('/assistant_feedback', async (req, res) => {
    const username = req.query.username;
    const feedback_texts = req.query.message;
    const user_score = req.query.user_score;

    try {
        const prompt = await generateFeedbackPrompt(username, feedback_texts, user_score);
        const thread_id = await getThreadID(username);

        if (prompt === null) {
            console.log("prompt was null");
            res.status(404).json({ message: 'Error reading user profile or session, username might be incorrect' });
            return;
        }

        try {
            let message = await openai.beta.threads.messages.create(thread_id, {
                role: "user",
                content: prompt
            });
            console.log("(Feedback) Prompt: ", message.content[0]["text"].value);
            /* console.log("(System) Prompt: ", systemMessage.content[0]["text"].value); */

            const run = await openai.beta.threads.runs.create(
                thread_id,
                { assistant_id: assistant_id }
            );

        // Create a response
        let response = await openai.beta.threads.runs.retrieve(thread_id, run.id);

        // Wait for the response to be ready
        while (response.status === "in_progress" || response.status === "queued") {
            console.log("waiting...");
            await new Promise((resolve) => setTimeout(resolve, 5000));
            response = await openai.beta.threads.runs.retrieve(thread_id, run.id);
        }

        // Get the messages for the thread
        const messageList = await openai.beta.threads.messages.list(thread_id);

        // Find the last message for the current run
        const lastMessage = messageList.data
            .filter((message) => message.run_id === run.id && message.role === "assistant")
            .pop();

        // Print the last message coming from the assistant
        if (lastMessage) {
            console.log(lastMessage.content[0]["text"].value);
        }

        let response_message = lastMessage.content[0]["text"].value;
        console.log(response_message);
        await save_message(username, response_message, false);
        res.json({ message: response_message });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(404).json({ message: 'Error reading user profile or session' });
    }
});

app.get('/ask_assistant', async (req, res) => {
    const username = req.query.username;
    console.log(`Username: ${username}`);

    const user_input = req.query.message;
    console.log(`User Input: ${user_input}`);

    await save_message(username, user_input, true);
    try {
        const prompt = await generatePrompt(username, user_input);
        const thread_id = await getThreadID(username);
        console.log("(Ask-Assistant) Prompt: ", prompt);
        if (prompt === null) {
            console.log("prompt was null");
            res.status(404).json({ message: 'Error reading user profile or session, username might be incorrect' });
            return;
        }
    
        try {
            console.log("message inserted into thread");
    
            const run = await openai.beta.threads.runs.create(
            thread_id,
            { 
                assistant_id: assistant_id
            },
            );
            console.log("run created");
            
            // Wait for the response to be ready
            let response = await openai.beta.threads.runs.retrieve(thread_id, run.id);
            console.log("got response object");
            
            while (response.status === "in_progress" || response.status === "queued") {
            console.log("waiting...");
            await new Promise((resolve) => setTimeout(resolve, 5000));
            console.log("waited");
            response = await openai.beta.threads.runs.retrieve(thread_id, run.id);
            console.log("got new response object");
            }
            console.log("response ready");
    
            // Add the system message and user message to the conversation
            const systemMessage = "You are a rude assistant. we need to be tough to our learners so they can learn by themselves rather than asking everything.";
            const messageList = [
            { role: "system", content: systemMessage },
            { role: "user", content: prompt }
            ];
    
            // Create a completion
            const chatResponse = await openai.chat.completions.create({
            messages: messageList,
            model: "gpt-4",
            //max_tokens: 300,
            });
    
            const lastMessage = chatResponse.choices[0].message.content;
    
            if (lastMessage) {
            console.log("message --> ", lastMessage);
            }
    
            let response_message = lastMessage;
            console.log(response_message);
            await save_message(username, response_message, false);
            res.json({ message: response_message });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
        } catch (error) {
        console.error('Error:', error);
        res.status(404).json({ message: 'Error reading user profile or session' });
        }
    }
);

app.get('/get_chat_history', async (req, res) => {
    const username = req.query.username;
    const sessionPath = path.join(`user_sessions/${username}_session.json`);

    try {
        const sessionData = await fs.readFile(sessionPath, 'utf8');
        const sessionJson = JSON.parse(sessionData);

        const course = sessionJson.course;
        const chats = sessionJson.chats;

        res.json(chats);
    } catch (error) {
        console.error('Error:', error);
        // Return an empty array as a response
        res.json([]);
    }

});

//!update course progression, dont know still how to structure my data and use this method
app.get('/update_course_state', async (req, res) => {
    const username = req.query.username
    const course = req.query.course
    const chapter = req.query.chapter
    const slide = req.query.slide

    const sessionPath = path.join(`user_sessions/${username}_session.json`)

    try {
        // access session
        const sessionData = await fs.readFile(sessionPath, 'utf8');
        const sessionJson = JSON.parse(sessionData);

        // update sessionJson with new values
        sessionJson.course = course
        sessionJson.chapter = chapter
        sessionJson.slide = slide

        // write the updated session data back to the file
        await fs.writeFile(sessionPath, JSON.stringify(sessionJson, null, 2), 'utf8')
        res.json({ message: 'Session data updated successfully' })

    } catch (error) {
        console.error('Error:', error)
        // Return an empty array as a response
        res.status(500).json({ message: 'Internal Server Error' })
    }
});

//* HELPER FUCNTIONS //

/* feed chatgpt with course data and user profile data */
async function populateThread(thread_id, username) {
    const chapterFolderPath = path.join('course_data/IoT');

    try {
        const files = await fs.readdir(chapterFolderPath);

        for (const file of files) {
            if (path.extname(file).toLowerCase() === '.json') {
                const chapterFilePath = path.join(chapterFolderPath, file);
                const chapterJsonData = await fs.readFile(chapterFilePath, 'utf-8');

                const chapterMessage = JSON.stringify(chapterJsonData);
                message = await openai.beta.threads.messages.create(
                    thread_id = thread_id.id, 
                    role="user",  
                    content = `Know: ${chapterMessage}`
                );

                console.log("The message has been inserted: ", message);
            }
        }

        const userProfilePath = `user_profiles/${username}.json`;
        const userProfileData = await fs.readFile(userProfilePath, 'utf8');
        const userProfileMessage = JSON.stringify(userProfileData);

        // Store user profile in the user session
        message = await openai.beta.threads.messages.create(thread_id, {
            role: "user",
            content: `User profile: ${userProfileMessage}`
        });
        console.log("Successfully populated thread");
    } catch (error) {
        console.log('Error: ', error);
    }
}

/* save chat to user sessions folder */
async function save_message(username, message, isUserMessage) {
    const sessionPath = path.join(`user_sessions/${username}_session.json`);

    try {
        // access session
        const sessionData = await fs.readFile(sessionPath, 'utf8');
        const sessionJson = JSON.parse(sessionData);

        const newMessage = {
            "sender": isUserMessage ? 'user' : 'assistant',
            "message": message
        };

        sessionJson.chats.push(newMessage);

        await fs.writeFile(sessionPath, JSON.stringify(sessionJson, null, 2), 'utf8');

        console.log("Message saved");
    } catch (error) {
        console.error('Error:', error);
    }
}

/* generates a prompt for chatgpt to answer according to current data has been provided */
async function generatePrompt(username, user_input) {

    const sessionPath = path.join(`user_sessions/${username}_session.json`);
    const profilePath = path.join(`user_profiles/${username}.json`);

    try {
        const sessionData = await fs.readFile(sessionPath, 'utf8');
        const sessionJson = JSON.parse(sessionData);

        //const chapter = sessionJson.chapter;
        //const slide = sessionJson.slide;
        
        const profileData = await fs.readFile(profilePath, 'utf8');
        const profileJson = JSON.parse(profileData);

        const answer_length = profileJson.answer_length;

        const result = `Answer the users question. Expected answer length: ${answer_length}\nState of knowledge: ${sessionJson}\nInput: ${user_input}`;
        return result;

    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function generateFeedbackPrompt(username, feedback_texts, user_score) {

    let result = "";

    const userProfilePath = path.join(`user_profiles/${username}.json`);

    const sessionPath = path.join(`user_sessions/${username}_session.json`);

    try {
        const userProfileContent = await fs.readFile(userProfilePath, 'utf8');
        const userProfileJson = JSON.parse(userProfileContent);

        const sessionData = await fs.readFile(sessionPath, 'utf8');
        const sessionJson = JSON.parse(sessionData);

        result += 'The user has completed a task.';
        if (user_score !== '') {
            result += `His result was as follows: ${user_score}.`;
        }
            result += `Be sure to use sample answers like this one: ${feedback_texts}`;
        return result;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

