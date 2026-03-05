import './PrewiewOwner.css'

/*export default function PrewiewOwner({user}) {
    return (
        <div id="container">
            <img src={user.foto} id="img" />
            <div id="username">{user.nome}</div> 
        </div>
    )
}*/



export default function PrewiewOwner({ user }) {
  if (!user) return null;

  return (
    <div id="container">
      <img src={user.foto} id="img" alt="profile" />
      <div id="username">{user.nome}</div>
    </div>
  );
}