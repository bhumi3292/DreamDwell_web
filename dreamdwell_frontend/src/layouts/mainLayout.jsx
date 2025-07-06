import React from 'react'
import { Outlet } from 'react-router-dom'
import Headers from '../layouts/navbar.jsx'

export default function mainLayout() {
    return (
        <div>
            <Headers/>
            <Outlet/>

        </div>

    )
}