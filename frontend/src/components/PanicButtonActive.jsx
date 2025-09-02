import { useState} from 'react';
import { panicButtonActivePage } from "../services/safetySession";

export function PanicButtonActivePage({sessionId, onPanicActivated}) {
    const [error, setError] = useState('');
    const [isActive, setIsActive] = useState(false);

    const handleClick = async () => {
        if (isActive) return;
        try {
            await panicButtonActivePage(sessionId);
            setIsActive(true)

            if (onPanicActivated) {
                onPanicActivated();
            }
        } catch(error) {
            setError(error.message);
            setIsActive(false);
        }
    }
    return (
        <button className="btn btn-secondary btn-square m-8" onClick={handleClick} disabled={isActive} >Ask for help</button>
    )
}