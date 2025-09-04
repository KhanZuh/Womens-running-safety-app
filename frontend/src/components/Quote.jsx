import { useState, useEffect } from "react";

const Quote = () => {

    const [quote, setQuote] = useState(null);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/quotes`)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched quote:", data);
            setQuote(data);
        })
        .catch(err => console.error("Failed to fetch quote", err));
    }, []);


    return (
        <div className="mx-12">
            {quote ? (
            <>
                <p className="italic">&quot;{quote.quote}&quot;</p>
                <p className="italic text-sm mt-2">- {quote.speaker}</p>
            </>
            ) : (
            <p>Loading...</p>
            )}
        </div>
    );
};

export default Quote;