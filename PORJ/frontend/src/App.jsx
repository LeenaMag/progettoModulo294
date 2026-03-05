import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { loader as itemsLoader } from './pages/HomePage.jsx'
import Base from './pages/Base.jsx'
import { loader as tagsloader } from './pages/AddIteamPage.jsx'
//import { loader as iteamLoader } from './pages/InfoIteamPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Singup from './pages/Singup.jsx'
import ItemPage, { loader as iteamLoader } from './pages/InfoIteamPage.jsx'
import AddItemPage from './pages/AddIteamPage.jsx'
import InfoIteam from './pages/InfoIteamPage.jsx'
import ChatPage, {loader as chatLoader} from './pages/ChatPage.jsx'



const router = createBrowserRouter([{
  path: "/",
  element: <Base />,
  id: 'root',
  hydrateFallbackElement: <div>Loading...</div>,
  children: [
    { index: true, element: <HomePage />, loader: itemsLoader },
    { path: "/:ricerca", element: <HomePage />, loader: itemsLoader },
    { path: "/addItem", element: <AddItemPage />, loader: tagsloader },
    { path: "/login", element: <LoginPage /> },
    { path: "/Singup", element: <Singup /> },
    { path: "/infoIteam", element: <InfoIteam />, loader: iteamLoader },
    { path: "/infoIteam/:itemId", element: <InfoIteam />, loader: iteamLoader },
    { path: "/chat/:ownerId", element: <ChatPage />, loader: chatLoader },
    //{ path: "/infoIteam", element: <InfoIteam />, loader: iteamLoader },
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
