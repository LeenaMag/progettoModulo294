import './SearchBar.css'
import {useNavigate} from 'react-router-dom'
export default function SearchBar() {
    const navigate = useNavigate();

    function seaechByString(){
        const text = document.getElementById("seaech-bar")
       navigate(`/${text.value}`)
    }
    return (
        <div id="bar-conteiner">
            <div id="bar">
                <img src="/search_icon_white.png" onClick={seaechByString} className="icon"/>
                <input type="text" id="seaech-bar"/>
            </div>
        </div>
    );
}