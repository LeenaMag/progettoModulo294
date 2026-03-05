import Message from "../components/Message";
import PrewiewOwner from "../components/PrewiewOwner";
import './ChatPage.css'
import { useContext } from "react";
import { useLoaderData } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';

export default function ChatPage() {
    const info = useLoaderData()
    const { user } = useContext(AuthContext);

    const messages = []
    for (let i = 0; i < info.messages.length; i++) {
        messages.push(<Message key={`M-${i}`} user={info.user.id = info.messages[i].id ? info.user : user} />)
    }

    function sendMessage() {
        const text = document.getElementById("inputMessage").value
        fetch("http://localhost:3000/user/messages", {
            method: "POST",
            credentials: 'include',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text, chatId: info.chatId})
        })
        location.reload()
    }

    return (
        <div>
            {messages}
            <div id="messageBar">
                <input type="text" id="inputMessage" />
                <button type="button" className="sendButton"onClick={sendMessage}>
                    <img src="/send-icon.png" className="icon" />
                </button>
            </div>
        </div>
    )
}

export async function loader({ params }) {
    let user = await fetch(`http://localhost:3000/user/userId/${params.ownerId}`, {credentials: 'include'})
    let chat = await fetch(`http://localhost:3000/user/chatMessages/${params.ownerId}`, {credentials: 'include'})

    if (!user.ok && !chat.ok) {
        throw new Error('Could not fetch items');
    }

    const info = { user: user.json(), messages: chat.json() }

    return info;
}