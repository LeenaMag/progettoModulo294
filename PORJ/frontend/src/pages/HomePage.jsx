import SearchBar from "../components/SearchBar";
import Item from "../components/Item";
import './HomePage.css'
import { useLoaderData, useNavigate, useSearchParams, useParams } from "react-router-dom";

export default function HomePage() {
    const items = useLoaderData()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const params = useParams()

    const page = Number(searchParams.get('page') || '1')

    const raws = []

    for (let i = 0; i < items.length / 3; i++) {
        const rowItems = []
        for (let j = 0; j < 3 && i * 3 + j < items.length; j++) {
            rowItems.push(<Item key={`${i * 3 + j}`} item={items[i * 3 + j]} />)
        }
        raws.push(
            <div key={`c-${i}`} className="itemContainer">
                {rowItems}
            </div>
        )
    }

    function goToPage(newPage) {
        if (newPage < 1) return

        if (params.ricerca) {
            navigate(`/search/${encodeURIComponent(params.ricerca)}?page=${newPage}`)
        } else {
            navigate(`/?page=${newPage}`)
        }
    }

    return (
        <>
            <SearchBar />
            <div id="containerRaws">
                {raws}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '30px 0' }}>
                <button onClick={() => goToPage(page - 1)} disabled={page === 1}>
                    Precedente
                </button>

                <span>Pagina {page}</span>

                <button onClick={() => goToPage(page + 1)}>
                    Successiva
                </button>
            </div>
        </>
    );
}

export async function loader({ params, request }) {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')

    let response

    if (params.ricerca) {
        response = await fetch(`http://localhost:3000/search/name/${encodeURIComponent(params.ricerca)}/${page}`)
    } else {
        response = await fetch(`http://localhost:3000/Items/items/${page}`)
    }

    if (!response.ok) {
        throw new Error('Could not fetch items')
    }

    return await response.json()
}