// AI Context/Frontend/services/mediaService.js
// Make sure API_BASE_URL is defined or imported if not already
const API_BASE_URL = 'http://localhost:8080/api'; // Example, ensure this is correct

export const uploadMediaFile = async (file, mediaType, token) => {
    if (!file || !mediaType || !token) {
        throw new Error("File, media type, and auth token are required for upload.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaType", mediaType); // 'image' or 'sound'

    console.log(`Uploading ${mediaType} file: ${file.name}`);

    const response = await fetch(`${API_BASE_URL}/media/upload`, { // Ensure API_BASE_URL is correct
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            // 'Content-Type': 'multipart/form-data' is set automatically by browser for FormData
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Upload media API Error (Type: ${mediaType}):`, errorData);
        throw new Error(errorData.message || `Failed to upload ${mediaType}. Status: ${response.status}`);
    }
    const data = await response.json(); // Expected: { filePath: string, fileUrl: string }
    console.log(`${mediaType} uploaded successfully:`, data);
    return data;
};