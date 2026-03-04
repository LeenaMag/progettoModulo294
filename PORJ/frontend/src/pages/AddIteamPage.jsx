import React from 'react';
import SearchBar from "../components/searchBar";
import { useNavigate, useLoaderData } from 'react-router-dom';
import './AddIteamPage.css';
import PrewiewOwner from '../components/PrewiewOwner';


export default function AddItemPage() {
    const navigate = useNavigate();
    const tags = useLoaderData();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitData = new FormData(e.target);
        /* Prendere utente da sessione */
        submitData.append('prod_creatore', 1);

        try {
            await fetch('http://127.0.0.1:3000/items/items', {
                method: 'POST',
                credentials: 'include',
                body: submitData
            });
            navigate('/');
        } catch (err) {
            console.error("Errore:", err);
            alert("Errore durante l'inserimento!");
        }
    };

    return (
        <div className="add-item-container">
            <SearchBar />
            
            <div className='center'>
                <h2>Aggiungi Prodotto</h2>
                <PrewiewOwner user ={{
                    foto: "#",
                    nome: "Mario Rossi"
                }}/>
                <form onSubmit={handleSubmit} className="add-item-form">
                
                    <div className='flexed'>
                        <div className='colL'>
                            <input type="file" name="prod_img" accept="image/*" className="file-input" required />
                        </div>
                        <div className='colR'>
                            <input type="text" name="prod_nome" placeholder="Nome del prodotto" required className='nome' />

                            <input type="number" name="prod_prezzo" placeholder="Prezzo (CHF)" step="0.05" required className='prezzo'/>

                            
                            <select name="prod_tipologia" required className='tag'>
                                {tags && tags.map((tipo) => (
                                    <option key={tipo.id} value={tipo.id}>
                                    {tipo.nome}
                                    </option>
                                ))}   
                            </select>
                            <textarea name="prod_descrizione" placeholder="Descrizione del prodotto breve" rows="3" required className='descrizione'></textarea>
                        </div>
                    </div>
                <button type="submit" className="submit-btn">Aggiungi</button>
            </form>
            </div>           
        </div>
    );
}

export async function loader() {
   // const { username } = useContext(AuthContext);
    const response = await fetch('http://127.0.0.1:3000/search/tags');
    //const res2 = await fetch (`http://127.0.0.1:3005/user/${username}`);
    if (!response.ok) {
        throw new Error('Impossibile caricare le tipologie');
    }
    return response.json();
}