import './PrewiewOwner.css'

export default function PrewiewOwner({user}) {
    return (
        <div id="container">
            <img src={user.foto} id="img" />
            <div id="username">{user.nome}</div> 
        </div>
    )
}