import './Item.css'
export default function Item({item}) {
    return (
        <div className='item-conteiner'>
            <div className='img-conteiner'>
                <img src={item.foto} className="img" />
            </div>
            <div className='textarea'>{item.nome}</div>
        </div>
    )
}