import React, { useContext } from 'react';
import SearchBar from '../components/SearchBar';
import { useNavigate, useLoaderData, Link } from 'react-router-dom';
import './AddIteamPage.css';
import PrewiewOwner from '../components/PrewiewOwner';
import { AuthContext } from '../context/AuthContext';


export default function AddItemPage() {
    const navigate = useNavigate();
    const tags = useLoaderData();
    const { user } = useContext(AuthContext);

    if (!user) {
        return <div>Devi fare il login</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitData = new FormData(e.target);
        /* Prendere utente da sessione */
        submitData.append('prod_creatore', 1);

        try {
            await fetch('http://localhost:3000/Items/items', {
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
                <div className='prewiewOwner'>
                    <PrewiewOwner user ={{
                        foto: user.foto ,
                        nome: user.username 
                    }}/>
                </div>
                
                <form onSubmit={handleSubmit} className="add-item-form">
                
                    <div className='flexed'>
                        <div className='colL'>
                            <input type="file" name="prod_img" accept="image/*" className="file-input" required />
                        </div>
                        <div className='colR'>
                            <input type="text" name="name" placeholder="Nome del prodotto" required className='nome' />

                            <input type="number" name="price" placeholder="Prezzo (CHF)" step="0.05" required className='prezzo'/>

                            
                            <select name="fk_tag" required className='tag'>
                                {tags && tags.map((tipo) => (
                                    <option key={tipo.id} value={tipo.id}>
                                    {tipo.nome}
                                    </option>
                                ))}   
                            </select>
                            <textarea name="description" placeholder="Descrizione del prodotto breve" rows="3" required className='descrizione'></textarea>
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
    const response = await fetch('http://localhost:3000/search/tags');
    //const res2 = await fetch (`http://127.0.0.1:3005/user/${username}`);
    if (!response.ok) {
        throw new Error('Impossibile caricare le tipologie');
    }
    return response.json();
}