'use client';
import {useEffect, useState} from 'react';
import {allowedDisplayValues} from "next/dist/compiled/@next/font/dist/constants";

export default function About() {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        try {
            const response = await fetch('https://28quizs.netlify.app/api/auth/users');
            const result = await response.json();
            setData(result.users);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);


    return (
        <>
            <h1>Users List</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                data.map((item) => (
                    <p>{item.username}</p>
                ))
            )}
        </>
    );
}