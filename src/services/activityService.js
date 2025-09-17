import { API_BASE_URL } from '../config/apiConfig';

export const getActivityNodeTypeDetails = async (activityNodeTypeId, token) => {
    if (!activityNodeTypeId || !token) {
        throw new Error('Activity Node Type ID and auth token are required.');
    }
    console.log(`activityService: Fetching details for ActivityNodeType ID: ${activityNodeTypeId}`);

    const response = await fetch(`${API_BASE_URL}/activity-node-types/${activityNodeTypeId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || `Failed to fetch activity details. Status: ${response.status}`;
        } catch (e) {
            errorMessage = response.statusText || `HTTP error! Status: ${response.status}`;
        }
        
        console.error(`Get Activity Details API Error (ID ${activityNodeTypeId}):`, errorMessage);

        if (response.status === 404) {
            throw new Error(`Activity not found (ID: ${activityNodeTypeId}). Server says: ${errorMessage}`);
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();

    console.log(`activityService: Received details for ID ${activityNodeTypeId}:`, data);

    return data;
};

export const getActivityDetails = async (activityId, token) => {
    if (!activityId || !token) {
        throw new Error('Activity ID and auth token are required.');
    }

    const response = await fetch(`${API_BASE_URL}/activities/${activityId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || `Failed to fetch activity details. Status: ${response.status}`;
        } catch (e) {
            errorMessage = response.statusText || `HTTP error! Status: ${response.status}`;
        }
        
        console.error(`Get Activity Details API Error (ID ${activityId}):`, errorMessage);

        if (response.status === 404) {
            throw new Error(`Activity not found (ID: ${activityId}). Server says: ${errorMessage}`);
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Transform the data to include gameMode if it's not already present
    return {
        ...data,
        gameMode: data.gameMode || data.activityType || 'READING', // Default to READING if not specified
    };
};

// ✨ THIS FUNCTION WILL SEND THE FOCUSED PAYLOAD FOR DETAILS UPDATE ✨
export const updateActivityNodeTypeDetails = async (activityNodeTypeId, detailsData, token) => {
    if (!activityNodeTypeId || !detailsData || !token) {
        throw new Error('Activity Node ID, details data, and auth token are required.');
    }
    // Ensure detailsData only contains what the backend DTO expects for this specific update
    // e.g., { activityTitle, instructions }
    const response = await fetch(`${API_BASE_URL}/activity-node-types/${activityNodeTypeId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(detailsData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(errorData.message || `Failed to update activity node details. Status: ${response.status}`);
    }
    return response.json();
};