import './SearchBar.css'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function SearchBar() {
    const navigate = useNavigate()
    const location = useLocation()
    const [text, setText] = useState('')

    function searchByString() {
        const value = text.trim()

        if (!value) {
            if (location.pathname.startsWith('/auctions')) {
                navigate('/auctions')
            } else {
                navigate('/')
            }
            return
        }

        if (location.pathname.startsWith('/auctions')) {
            navigate(`/auctions/${encodeURIComponent(value)}`)
        } else {
            navigate(`/search/${encodeURIComponent(value)}`)
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            searchByString()
        }
    }

    return (
        <div id="bar-conteiner">
            <div id="bar">
                <img
                    src="/search_icon_white.png"
                    onClick={searchByString}
                    className="icon"
                />
                <input
                    type="text"
                    id="seaech-bar"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
        </div>
    )
}