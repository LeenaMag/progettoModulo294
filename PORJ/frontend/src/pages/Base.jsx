import { Outlet, useLoaderData, useSubmit } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Base() {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    )
}