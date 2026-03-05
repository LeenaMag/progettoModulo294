import PrewiewOwner from "./PrewiewOwner";
export default function Message({ user, message }) {
    return (
        <div className="message">
            <PrewiewOwner user={{
                foto: user.foto,
                nome: user.username
            }}/>
            <div>
                {message.testo}
            </div>
        </div>
    )
}