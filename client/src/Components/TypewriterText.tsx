import { useState, useEffect } from "react";

type TypewriterTextProps = {
    text: string;
};

function TypewriterText({ text }: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        setDisplayedText(""); 
        let index = 0;

        const typingSpeed = text.length > 500 ? 5 : 
                            text.length > 300 ? 10 : 
                            text.length > 300 ? 20 : 50

        const intervalId = setInterval(() => {
            if (index < text.length) {
                
                setDisplayedText((prev) => prev + (text[index] ?? "")); 
                index++;
            } else {
                clearInterval(intervalId);
            }
        }, typingSpeed); 

        return () => clearInterval(intervalId); 
    }, [text]);

    return <span>{displayedText}</span>;
}

export default TypewriterText;


