import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { loader as itemsLoader } from './pages/HomePage.jsx'
import Base from './pages/Base.jsx'
import HomePage from './pages/HomePage.jsx'
// import ItemPage, { loader as itemLoader } from './pages/ItemPage.jsx'
// import AddItemPage from './pages/AddItemPage.jsx'


const router = createBrowserRouter([{
  path: "/",
  element: <Base />,
  id: 'root',
  children: [
     { index: true, element: <HomePage />, loader: itemsLoader },
    // { path: "item/:id", element: <ItemPage />, loader: itemLoader },
    // { path: "addItem", element: <AddItemPage /> }
  ]
}])

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
