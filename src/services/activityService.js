const API_BASE_URL = 'http://localhost:8080/api'; // Ensure this is defined correctly

export const getActivityNodeTypeDetails = async (activityNodeTypeId, token) => {
    if (!activityNodeTypeId || !token) {
        throw new Error('Activity Node Type ID and auth token are required.');
    }
    console.log(`activityService: Fetching details for ActivityNodeType ID: ${activityNodeTypeId}`);

    // Make sure this line uses template literals correctly:
    const response = await fetch(`${API_BASE_URL}/activity-node-types/${activityNodeTypeId}`, { // <<<< CHECK THIS LINE CAREFULLY
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json', // Good practice to add this
        },
    });

    if (!response.ok) {
        // Handle non-JSON error responses more gracefully
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || `Failed to fetch activity details. Status: ${response.status}`;
        } catch (e) {
            // If response is not JSON, use the status text or a generic message
            errorMessage = response.statusText || `HTTP error! Status: ${response.status}`;
        }
        
        console.error(`Get Activity Details API Error (ID ${activityNodeTypeId}):`, errorMessage);

        if (response.status === 404) {
            throw new Error(`Activity not found (ID: ${activityNodeTypeId}). Server says: ${errorMessage}`);
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    // ... (rest of your existing logic for handling data) ...
    return data;
};