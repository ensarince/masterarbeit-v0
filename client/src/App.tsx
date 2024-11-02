import { useState } from "react";
import axios from "axios"
import styles from "./App.module.scss"

function App() {

  const [response, setResponse] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [behavior, setBehavior] = useState<string>("Anthropomorphic"); //default to antromorhpic

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }

  const onBehaviorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBehavior(e.target.value);
  }

  const handleSubmit = async () => {
    const response = await axios.post("http://localhost:4402/chatbot", {
      question: value,
      behavior: behavior
    });
    setResponse(response.data);
  };

  return (
    <>
    <div className={styles.container}>
      <div>
        <input
          className={styles.input}
          placeholder="how can I help?"
          type="text"
          value={value}
          onChange={onChange}
        />
      </div>
      <div>
        <select value={behavior} className={styles.dropdown} onChange={onBehaviorChange}>
          <option value="Anthropomorphic">Anthropomorphic</option>
          <option value="Robot">Robot</option>
        </select>
      </div>
      <div style={{
        alignSelf:"end",
        marginBottom:"1rem"
      }}>
        <button onClick={handleSubmit}>Ok</button>
      </div>
      <div className={styles.chatbox}>
        <div className={`${styles.message} ${styles.user}`}>
          <div className={`${styles.bubble} ${styles.user}`}>User: {value}</div>
        </div>
        <div className={`${styles.message} ${styles.bot}`}>
          <div className={`${styles.bubble} ${styles.bot}`}>Chatbot: {response}</div>
        </div>
      </div>
    </div>
    </>
  )
}

export default App
