import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { loader as itemsLoader } from './pages/HomePage.jsx'
import Base from './pages/Base.jsx'
import { loader as tagsloader } from './pages/AddItemPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Singup from './pages/singup.jsx'
// import ItemPage, { loader as itemLoader } from './pages/ItemPage.jsx'
import AddItemPage from './pages/AddItemPage.jsx'


const router = createBrowserRouter([{
  path: "/",
  element: <Base />,
  id: 'root',
  children: [
    { index: true, element: <HomePage />, loader: itemsLoader },
    { path: "/:ricerca", element: <HomePage />, loader: itemsLoader },
    { path: "/addItem", element: <AddItemPage />, loader: tagsloader },
    { path: "/login", element: <LoginPage /> },
    { path: "/singup", element: <Singup /> },
    // { path: "addItem", element: <AddItemPage /> }
  ]
}])

function App() {
  return (
    
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
