import PrewiewOwner from "../components/PrewiewOwner";
import './HomePage.css'
import { useLoaderData } from "react-router-dom";

export default function HomePage() {
    const items = useLoaderData()

    return (
        <>
            <PrewiewOwner user={{
                foto: user.foto,
                nome: user.username
            }} />
        </>
    )
}

export async function loader({ params }) {
      let user = await fetch(`http://localhost:3000/user/userId/${params.id}`)
      let chat = await fetch(`http://localhost:3000/user/chatMessages/${params.id}`)

    if (!user.ok && !chat.ok) {
        throw new Error('Could not fetch items');
    }

    const info = {user: user.json(), messages: chat.json()}

    return info;
}