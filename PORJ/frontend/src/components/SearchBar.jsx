import './SearchBar.css'
export default function SearchBar() {
    return (
        <div id="bar-conteiner">
            <div id="bar">
                <img src="/search-icon.png" alt="" className="icon"/>
                <input type="text" id="seaech-bar"/>
            </div>
        </div>
    );
}