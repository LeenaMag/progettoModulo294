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
import AuctionListPage, { loader as auctionsLoader } from './pages/AuctionListPage.jsx';
import AuctionDetailPage, { loader as auctionDetailLoader } from './pages/AuctionDetailPage.jsx';
import CartPage, { loader as cartLoader } from './pages/CartPage.jsx';
import FavoritesPage, { loader as favoritesLoader } from './pages/FavoritesPage.jsx';
import UserSettingsPage, { loader as settingsLoader } from './pages/UserSettingsPage.jsx';
import UserProfilePage, { loader as userProfileLoader } from './pages/UserProfilePage.jsx';
import CreateAuctionPage, { loader as createAuctionLoader } from './pages/CreateAuctionPage.jsx';
import NotificationsPage, { loader as notificationsLoader } from './pages/NotificationsPage.jsx';
import ChatsListPage, { loader as chatsListLoader } from './pages/ChatsListPage.jsx';
import TagSearchPage, { loader as tagSearchLoader } from './pages/TagSearchPage.jsx';
import EditItemPage, { loader as editItemLoader } from './pages/EditItemPage.jsx';

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
    { path: "/auctions", element: <AuctionListPage />, loader: auctionsLoader },
    { path: "/auctions/:ricerca", element: <AuctionListPage />, loader: auctionsLoader },
    { path: "/auction/:auctionId", element: <AuctionDetailPage />, loader: auctionDetailLoader },
    { path: "/catalogo", element: <CartPage />, loader: cartLoader },
    { path: "/preferiti", element: <FavoritesPage />, loader: favoritesLoader },
    { path: "/impostazioni", element: <UserSettingsPage />, loader: settingsLoader },
    { path: "/user/:username", element: <UserProfilePage />, loader: userProfileLoader },
    { path: "/aste/crea", element: <CreateAuctionPage />, loader: createAuctionLoader },
    { path: "/notifiche", element: <NotificationsPage />, loader: notificationsLoader },
    { path: "/chats", element: <ChatsListPage />, loader: chatsListLoader },
    { path: "/tag", element: <TagSearchPage />, loader: tagSearchLoader },
    { path: "/tag/:tagName", element: <TagSearchPage />, loader: tagSearchLoader },
    { path: "/item/edit/:itemId", element: <EditItemPage />, loader: editItemLoader },
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
