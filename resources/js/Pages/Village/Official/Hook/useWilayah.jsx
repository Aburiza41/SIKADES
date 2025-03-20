import { useState, useEffect } from "react";
import axios from "axios";

const useWilayah = () => {
    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    const fetchProvinces = async () => {
        try {
            const response = await axios.get("https://sig.bps.go.id/rest-bridging/getwilayah?level=0");
            setProvinces(response.data.data);
        } catch (error) {
            console.error("Error fetching provinces:", error);
        }
    };

    const fetchRegencies = async (provinceCode) => {
        try {
            const response = await axios.get(`https://sig.bps.go.id/rest-bridging/getwilayah?level=1&parent=${provinceCode}`);
            setRegencies(response.data.data);
        } catch (error) {
            console.error("Error fetching regencies:", error);
        }
    };

    const fetchDistricts = async (regencyCode) => {
        try {
            const response = await axios.get(`https://sig.bps.go.id/rest-bridging/getwilayah?level=2&parent=${regencyCode}`);
            setDistricts(response.data.data);
        } catch (error) {
            console.error("Error fetching districts:", error);
        }
    };

    const fetchVillages = async (districtCode) => {
        try {
            const response = await axios.get(`https://sig.bps.go.id/rest-bridging/getwilayah?level=3&parent=${districtCode}`);
            setVillages(response.data.data);
        } catch (error) {
            console.error("Error fetching villages:", error);
        }
    };

    useEffect(() => {
        fetchProvinces();
    }, []);

    return {
        provinces,
        regencies,
        districts,
        villages,
        fetchRegencies,
        fetchDistricts,
        fetchVillages,
    };
};

export default useWilayah;
