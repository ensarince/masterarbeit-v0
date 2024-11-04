import { useEffect, useState } from "react";
import axios from "axios"
import styles from "./Chatbot.module.scss"
import { User } from "firebase/auth";
import { collection, addDoc, getFirestore, onSnapshot, orderBy, query } from "firebase/firestore";
import { app } from "../../firebase"; 

type Props = {
    user: User | null;
}

type Message = {
    text: string;
    sender: "user" | "bot";
    createdAt: number; 
};

export default function Chatbot({
    user
}: Props) {

    const [value, setValue] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const db = getFirestore(app);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }

    useEffect(() => {
        if (!user) return;
    
        const messagesRef = collection(db, `users/${user.uid}/conversations`);
        const messagesQuery = query(messagesRef, orderBy("createdAt", "asc")); 
    
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const loadedMessages: Message[] = snapshot.docs.map((doc) => doc.data() as Message);
            setMessages(loadedMessages);
        });
    
        return () => unsubscribe();
    }, [user, db]);

    const saveMessageToFirestore = async (message: Omit<Message, 'createdAt'>) => {
        if (!user) return;
    
        const messagesRef = collection(db, `users/${user.uid}/conversations`);
        await addDoc(messagesRef, { ...message, createdAt: Date.now() }); 
    };

    const handleSubmit = async () => {
        if (!value) return;

        const userMessage: Message = { text: value, sender: "user", createdAt: Date.now() };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        saveMessageToFirestore(userMessage);

        setIsLoading(true);

        try {
            const result = await axios.post("http://localhost:4402/chatbot", { question: value });

            const botMessage: Message = { text: result.data, sender: "bot", createdAt: Date.now() };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
            saveMessageToFirestore(botMessage);

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
                            {msg.text}
                        </div>
                    </div>
                ))}
            {isLoading && 
                <div className={styles.typingIndicator}>
                    Bot is typing...
                </div>
            }
        </div>

        <div className={styles.stickyBottom}>
            <input
                className={styles.input}
                placeholder="Type your question..."
                type="text"
                value={value}
                onChange={onChange}
            />

            <button 
                onClick={handleSubmit} 
                disabled={isLoading}>
                    Send
            </button>

            {error &&
                <p className={styles.error}>
                    {error}
                </p>
            }
        </div>
    </div>
)
}