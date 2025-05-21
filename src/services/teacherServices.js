// AI Context/Frontend/services/teacherService.js_new
const API_BASE_URL = 'http://localhost:8080/api'; // Ensure this matches your backend URL

/**
 * Fetches all teachers. (Superadmin access)
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of teacher detail objects.
 */
export const getAllTeachers = async (token) => {
    if (!token) {
        throw new Error('Auth token is required to fetch teachers.');
    }
    console.log(`teacherService: Fetching all teachers`);
    const response = await fetch(`${API_BASE_URL}/teachers`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Get All Teachers API Error:`, errorData);
        throw new Error(errorData.message || `Failed to fetch teachers. Status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
};

/**
 * Assigns a role to a target teacher. (Superadmin access)
 * @param {string} targetTeacherId - The ID of the teacher to whom the role is being assigned.
 * @param {string} roleName - The name of the role to assign (e.g., "ROLE_ADMIN").
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the updated teacher details object.
 */
export const assignRoleToTeacher = async (targetTeacherId, roleName, token) => {
    if (!targetTeacherId || !roleName || !token) {
        throw new Error('Target Teacher ID, Role Name, and Auth Token are required.');
    }
    console.log(`teacherService: Assigning role '${roleName}' to teacher '${targetTeacherId}'`);
    const response = await fetch(`${API_BASE_URL}/teachers/${targetTeacherId}/roles/assign`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleName }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Assign Role API Error (Teacher ${targetTeacherId}, Role ${roleName}):`, errorData);
        throw new Error(errorData.message || `Failed to assign role. Status: ${response.status}`);
    }
    return response.json();
};

/**
 * Revokes a role from a target teacher. (Superadmin access)
 * @param {string} targetTeacherId - The ID of the teacher from whom the role is being revoked.
 * @param {string} roleName - The name of the role to revoke.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the updated teacher details object.
 */
export const revokeRoleFromTeacher = async (targetTeacherId, roleName, token) => {
    if (!targetTeacherId || !roleName || !token) {
        throw new Error('Target Teacher ID, Role Name, and Auth Token are required.');
    }
    console.log(`teacherService: Revoking role '${roleName}' from teacher '${targetTeacherId}'`);
    const response = await fetch(`${API_BASE_URL}/teachers/${targetTeacherId}/roles/revoke`, {
        method: 'POST', // Backend uses POST for revoke as well
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleName }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Revoke Role API Error (Teacher ${targetTeacherId}, Role ${roleName}):`, errorData);
        throw new Error(errorData.message || `Failed to revoke role. Status: ${response.status}`);
    }
    return response.json();
};