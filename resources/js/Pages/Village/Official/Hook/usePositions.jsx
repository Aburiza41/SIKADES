import { useState, useEffect } from "react";
import axios from "axios";

const usePositions = () => {
    const [positions, setPositions] = useState([]);

    const fetchPositions = async () => {
        try {
            const response = await axios.get("/api/positions"); // Sesuaikan endpoint dengan backend Anda
            setPositions(response.data);
        } catch (error) {
            console.error("Error fetching positions:", error);
        }
    };

    useEffect(() => {
        fetchPositions();
    }, []);

    return { positions };
};

export default usePositions;
