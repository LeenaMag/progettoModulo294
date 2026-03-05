/*import './Item.css'
export default function Item({item}) {
    console.log(item)
    return (
        <div className='item-conteiner'>
            <div className='img-conteiner'>
                <img src={item.foto} className="img" />
            </div>
            <div className='textarea'>{item.nome}</div>
        </div>
    )
}*/

import './Item.css';
import { Link } from 'react-router-dom';

export default function Item({ item }) {
  // support in case the id field name changes
  const itemId = item?.id ?? item?.itemId ?? item?.prod_id ?? item?.fk_oggetto;

  return (
    <Link
      className="item-link"
      to={itemId != null ? `/infoIteam/${itemId}` : '/'}
      aria-label={item?.nome ? `Open details: ${item.nome}` : 'Open details'}
    >
      <div className="item-conteiner">
        <div className="img-conteiner">
          <img src={item?.foto} className="img" alt={item?.nome || 'Item'} />
        </div>
        <div className="textarea">{item?.nome}</div>
      </div>
    </Link>
  );
}