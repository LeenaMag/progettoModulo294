import Message from "../components/Message";
import PrewiewOwner from "../components/PrewiewOwner";
import './ChatPage.css'
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
            body: { text: text, chatId: info.messages[0].fk_chat}
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
    let user = await fetch(`http://localhost:3000/user/userId/${params.ownerId}`)
    let chat = await fetch(`http://localhost:3000/user/chatMessages/${params.ownerId}`)

    if (!user.ok && !chat.ok) {
        throw new Error('Could not fetch items');
    }

    const info = { user: user.json(), messages: chat.json() }

    return info;
}