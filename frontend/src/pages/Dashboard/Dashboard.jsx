import {useState} from "react";

export function Dashboard() {
    const [selectedDuration, setSelectedDuration] = useState(null);

    const handleStartRun = () => {
        if (selectedDuration) {
            console.log(`Run started for ${selectedDuration} minutes!`);
        } else {
            alert("Please select a duration before starting the run.");
        }
    };

    const durations = ['30 minutes', '1 hour', '2 hours'];

    return (
        <>
        <h1>Dashboard</h1>
        <p>Let someone know you&#39;re running - Just incase.</p>
        <p>Enter your estimated run and we&#39;ll handle the rest.</p>
        <p>How long will you run?</p>

        <div>
            {durations.map((duration) => (
                <button key={duration} onClick={() => setSelectedDuration(duration)}>
                    {duration}
                </button>
            ))}
        </div>
        
        {/* <button>30 minutes</button>
        <button>1 hour</button>
        <button>2 hours</button> */}

        <h3>Emergency Contact:</h3>
        <p>Name: Jane Doe</p>
        <p>Email: janedoe@example.com</p>

        <button onClick={handleStartRun}>Start Run</button>
        </>

    )
}