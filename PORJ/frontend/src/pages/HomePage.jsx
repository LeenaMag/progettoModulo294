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

export async function loader({ request, param }) {
    const response = await fetch('http://127.0.0.1:3000/item/items');

    if (!response.ok) {
        throw new Error('Could not fetch items');
    }
    console.log(response)

    return response.json();
}