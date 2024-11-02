import { useState } from "react";
import axios from "axios"
import styles from "./Chatbot.module.scss"

type Props = {}

type Message = {
    text: string;
    sender: "user" | "bot";
};

export default function Chatbot({}: Props) {

    //const [response, setResponse] = useState<string>("");
    const [value, setValue] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }

    const handleSubmit = async () => {
        if (!value) return;
        
        // Add user's message to the messages array
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: value, sender: "user" }
        ]);
        
        setIsLoading(true);

        try {
            const result = await axios.post("http://localhost:4402/chatbot", { question: value });
            
            // Add bot's response to the messages array
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: result.data, sender: "bot" }
            ]);
            setValue("");
            setError("");
        } catch (err) {
            setError("Could not load response. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

return (
    <div className={styles.container}>
        <div className={styles.chatbox}>
            {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`${styles.message} ${styles[msg.sender]}`}
                    >
                        <div className={`${styles.bubble} ${styles[msg.sender]}`}>
                            {msg.sender === "user" ? "You" : "Chatbot"}: {msg.text}
                        </div>
                    </div>
                ))}
            {isLoading && <div className={styles.typingIndicator}>Bot is typing...</div>}
        </div>
        <input
            className={styles.input}
            placeholder="Type your question..."
            type="text"
            value={value}
            onChange={onChange}
        />
        <button onClick={handleSubmit} disabled={isLoading}>Send</button>
        {error && <p className={styles.error}>{error}</p>}
    </div>
)
}