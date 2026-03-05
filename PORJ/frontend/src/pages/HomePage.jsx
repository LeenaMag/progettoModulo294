import SearchBar from "../components/searchBar";
import Item from "../components/Item";
import './HomePage.css'
import { useLoaderData } from "react-router-dom";

export default function HomePage() {
    const items = useLoaderData()

    const raws = []

    for (let i = 0; i < items.length / 3; i++) {
        const rowItems = []
        for (let j = 0; j < 3 && i * 3 + j < items.length; j++) {
            rowItems.push(<Item key={`${i * 3 + j}`} item={items[i * 3 + j]} />)
        }
        raws.push(<div key={`c-${i}`} className="itemContainer">{rowItems}
        </div>)
    }
    return (
        <>
            <SearchBar />
            <div id="containerRaws">
                {raws}
            </div>
        </>
    );
}

export async function loader({ params }) {
    let response = { ok: false}
    if(params.ricerca){
        response = await fetch(`http://localhost:3000/search/${params.ricerca}/1`)

    }else {
        response = await fetch('http://localhost:3000/Items/items/1');
    }

    if (!response.ok) {
        throw new Error('Could not fetch items');
    }

    const json = response.json()

    console.log(json)

    return json;
}