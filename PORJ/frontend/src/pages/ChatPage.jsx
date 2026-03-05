import Message from "../components/Message";
import "./ChatPage.css";
import { useContext } from "react";
import { useLoaderData } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ChatPage() {
  const info = useLoaderData();
  const { user } = useContext(AuthContext);

  // costruzione lista messaggi (usa map invece di for + push)
  const messages = (info.messages ?? []).map((m, i) => (
    <Message
      key={`M-${i}`}
      message={m}
      // cambia fk_utente con il nome reale del campo nel tuo messaggio
      user={m.fk_utente === user.id ? user : info.user}
    />
  ));

  async function sendMessage() {
    const text = document.getElementById("inputMessage").value;

    // chatId: usa quello del loader, altrimenti prova dal primo messaggio
    const chatId = info.chatId ?? info.messages?.[0]?.fk_chat;

    if (!chatId) {
      console.error("chatId undefined: il backend deve ritornare chatId o fk_chat nei messaggi");
      return;
    }

    await fetch("http://localhost:3000/user/messages", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, chatId }),
    });

    location.reload();
  }

  return (
    <div>
      {messages}
      <div id="messageBar">
        <input type="text" id="inputMessage" />
        <button type="button" className="sendButton" onClick={sendMessage}>
          <img src="/send-icon.png" className="icon" />
        </button>
      </div>
    </div>
  );
}

export async function loader({ params }) {
  const userRes = await fetch(`http://localhost:3000/user/userId/${params.ownerId}`, {
    credentials: "include",
  });

  const chatRes = await fetch(`http://localhost:3000/user/chatMessages/${params.ownerId}`, {
    credentials: "include",
  });

  // basta che UNO fallisca -> errore
  if (!userRes.ok || !chatRes.ok) {
    throw new Error("Could not fetch items");
  }

  const user = await userRes.json();
  const chatData = await chatRes.json();

  // supporta 2 casi:
  // 1) backend ritorna array di messaggi
  // 2) backend ritorna { chatId, messages }
  const messages = Array.isArray(chatData) ? chatData : (chatData.messages ?? []);
  const chatId = Array.isArray(chatData) ? undefined : chatData.chatId;

  return { user, messages, chatId };
}