import { useState } from "react";
import Chatbot from "./Components/Chatbot/Chatbot"
import { User } from "firebase/auth";

import "./App.module.scss"
import Authentication from "./Components/Authentication/Authentication";

function App() {

  const [user, setUser] = useState<User | null>(null);

  return (
    <div>
      
      <Authentication 
        user={user}
        setUser={setUser}
      />
      {user !== null &&
      <Chatbot 
        user={user}
      />
      }
    </div>
  )
}

export default App
