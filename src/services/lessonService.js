import { API_BASE_URL } from '../config/apiConfig';

// --- Question Management ---

export const createQuestionForActivityNode = async (activityNodeTypeId, questionPayload, token) => {
    if (!activityNodeTypeId || !token) {
        throw new Error('ActivityNodeType ID and auth token are required.');
    }

    const formData = new FormData();

    const files = [];
    if (questionPayload.imageFile) {
        files.push(questionPayload.imageFile);
        questionPayload.questionImageUrl = questionPayload.imageFile.name;
    }
    if (questionPayload.audioFile) {
        files.push(questionPayload.audioFile);
        questionPayload.questionSoundUrl = questionPayload.audioFile.name;
    }

    if (Array.isArray(questionPayload.choices)) {
        questionPayload.choices = questionPayload.choices.map(choice => {
            if (choice.imageFile) {
                files.push(choice.imageFile);
                choice.imageFileName = choice.imageFile.name;
            }
            if (choice.audioFile) {
                files.push(choice.audioFile);
                choice.audioFileName = choice.audioFile.name;
            }
            return choice;
        });
    }

    formData.append("questionDto", JSON.stringify(questionPayload));
    files.forEach(f => formData.append("files", f)); // Important: append all files under "files"

    const response = await fetch(`${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to create question. Status: ${response.status}`);
    }

    return response.json();
};

export const getQuestionsForActivityNode = async (activityNodeTypeId, token) => {
    if (!activityNodeTypeId || !token) {
        throw new Error('ActivityNodeType ID and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch questions. Status: ${response.status}`);
    }
    return response.json();
};

export const updateQuestion = async (activityNodeTypeId, questionId, questionData, token) => {
    if (!activityNodeTypeId || !questionId || !questionData || !token) {
        throw new Error('ActivityNodeType ID, Question ID, question data, and auth token are required.');
    }

    const url = `${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions/${questionId}`;

    const hasFilesToUpload =
        questionData.imageFile instanceof File ||
        questionData.audioFile instanceof File ||
        (Array.isArray(questionData.choices) &&
            questionData.choices.some(c => c.imageFile instanceof File || c.audioFile instanceof File));

    if (hasFilesToUpload) {
        console.log('🔄 Detected file updates, preparing multipart/form-data...');

        const formData = new FormData();
        const filesToAppend = [];

        // Build deep-cloned choices with unique file names
        const choicesPayload = questionData.choices.map(choice => {
            const cloned = { ...choice };
            const ts = Date.now();

            if (choice.imageFile instanceof File) {
                const filename = `choice_image_${ts}_${choice.imageFile.name}`;
                cloned.imageFileName = filename;
                filesToAppend.push({ name: filename, file: choice.imageFile });
            }

            if (choice.audioFile instanceof File) {
                const filename = `choice_audio_${ts}_${choice.audioFile.name}`;
                cloned.audioFileName = filename;
                filesToAppend.push({ name: filename, file: choice.audioFile });
            }

            delete cloned.imageFile;
            delete cloned.audioFile;

            return cloned;
        });

        // Handle question-level image/audio
        const ts = Date.now();
        const questionDtoPayload = {
            ...questionData,
            choices: choicesPayload,
            questionImageUrl: questionData.questionImageUrl || null,
            questionSoundUrl: questionData.questionSoundUrl || null,
        };

        if (questionData.imageFile instanceof File) {
            const filename = `question_image_${ts}_${questionData.imageFile.name}`;
            questionDtoPayload.questionImageUrl = filename;
            filesToAppend.push({ name: filename, file: questionData.imageFile });
        }

        if (questionData.audioFile instanceof File) {
            const filename = `question_audio_${ts}_${questionData.audioFile.name}`;
            questionDtoPayload.questionSoundUrl = filename;
            filesToAppend.push({ name: filename, file: questionData.audioFile });
        }

        // Append JSON DTO
        formData.append('questionDto', JSON.stringify(questionDtoPayload));

        // Append files
        filesToAppend.forEach(({ file, name }) => {
            formData.append('files', file, name);
        });

        // 🔐 Send request
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`
                // No Content-Type needed for multipart!
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to update question. Status: ${response.status}`);
        }

        return response.json();
    }

    // Fallback: No files, send pure JSON
    console.log('📦 No files detected. Sending JSON...');
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to update question. Status: ${response.status}`);
    }

    return response.json();
};


export const deleteQuestion = async (activityNodeTypeId, questionId, token) => {
    if (!activityNodeTypeId || !questionId || !token) {
        throw new Error('ActivityNodeType ID, Question ID, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to delete question. Status: ${response.status}`);
    }
    if (response.status === 204) return { message: "Question deleted successfully" };
    return response.json();
};


// --- Choice Management ---

export const getChoicesForQuestion = async (activityNodeTypeId, questionId, token) => {
    if (!activityNodeTypeId || !questionId || !token) {
        throw new Error('ActivityNodeType ID, Question ID, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions/${questionId}/choices`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch choices. Status: ${response.status}`);
    }
    return response.json();
};

export const createChoiceForQuestion = async (actId, qId, choiceData, token) => {
    const url = `${API_BASE_URL}/activity-node-types/${actId}/questions/${qId}/choices`;
    const hasFiles = choiceData.imageFile || choiceData.audioFile;

    if (hasFiles) {
        const form = new FormData();
        form.append("choiceText", choiceData.choiceText);
        form.append("isCorrect", choiceData.isCorrect);
        if (choiceData.imageFile) form.append("imageFile", choiceData.imageFile);
        if (choiceData.audioFile) form.append("audioFile", choiceData.audioFile);

        const resp = await fetch(url, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: form
        });
        if (!resp.ok) throw new Error(await resp.text());
        return resp.json();
    } else {
        const resp = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(choiceData)
        });
        if (!resp.ok) throw new Error(await resp.text());
        return resp.json();
    }
};

export const updateChoice = async (activityNodeTypeId, questionId, choiceId, choiceData, token) => {
    if (!activityNodeTypeId || !questionId || !choiceId || !choiceData || !token) {
        throw new Error('Required IDs, choice data, and auth token must be provided.');
    }
    const url = `${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions/${questionId}/choices/${choiceId}`;

    const hasNewFiles = choiceData.imageFile || choiceData.audioFile;
    const isRemovingFiles = choiceData.removeImage || choiceData.removeAudio;

    if (hasNewFiles || isRemovingFiles) {
        const formData = new FormData();
        formData.append('choiceText', choiceData.choiceText);
        formData.append('isCorrect', choiceData.isCorrect);
        if (choiceData.imageFile) formData.append('imageFile', choiceData.imageFile);
        if (choiceData.audioFile) formData.append('audioFile', choiceData.audioFile);
        if (choiceData.removeImage) formData.append('removeImage', true);
        if (choiceData.removeAudio) formData.append('removeAudio', true);

        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
            throw new Error(errorData.message || `Failed to update choice with files. Status: ${response.status}`);
        }
        return response.json();
    } else {
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(choiceData),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
            throw new Error(errorData.message || `Failed to update choice. Status: ${response.status}`);
        }
        return response.json();
    }
};

export const deleteChoice = async (activityNodeTypeId, questionId, choiceId, token) => {
    if (!activityNodeTypeId || !questionId || !choiceId || !token) {
        throw new Error('ActivityNodeType ID, Question ID, Choice ID, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions/${questionId}/choices/${choiceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to delete choice. Status: ${response.status}`);
    }
    if (response.status === 204) return { message: "Choice deleted successfully" };
    return response.json();
};

// ... (Rest of your unchanged functions)
export const getLessonDefinitions = async (courseId, token) => {
    if (!courseId || !token) {
        throw new Error('Course ID and auth token are required to fetch lesson definitions.');
    }
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lesson-definitions`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch lesson definitions. Status: ${response.status}`);
    }
    return response.json();
};

export const getActivityNodeTypesForLesson = async (lessonDefinitionId, token) => {
    if (!lessonDefinitionId || !token) {
        throw new Error('Lesson Definition ID and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/lesson-definitions/${lessonDefinitionId}/activity-node-types`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch activity node types. Status: ${response.status}`);
    }
    return response.json();
};

export const createLessonDefinition = async (courseId, lessonData, token) => {
    if (!courseId || !lessonData || !token) {
        throw new Error('Course ID, lesson data, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to create lesson. Status: ${response.status}`);
    }
    return response.json();
};

export const createActivityNodeTypeForLesson = async (lessonDefinitionId, activityNodeData, token) => {
    if (!lessonDefinitionId || !activityNodeData || !token) {
        throw new Error('Lesson Definition ID, activity node data, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/lesson-definitions/${lessonDefinitionId}/activity-node-types`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(activityNodeData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to create activity node type. Status: ${response.status}`);
    }
    return response.json();
};

export const getStudentLessonProgress = async (studentId, lessonDefinitionId, token) => {
    if (!studentId || !lessonDefinitionId || !token) {
        throw new Error('Student ID, Lesson Definition ID, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/students/${studentId}/lesson-progress/definition/${lessonDefinitionId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (response.status === 404) return null;
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch lesson progress. Status: ${response.status}`);
    }
    return response.json();
};

export const startLessonProgress = async (lessonDefinitionId, token) => {
    if (!lessonDefinitionId || !token) {
        throw new Error('Lesson Definition ID and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/lesson-progress/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonDefinitionId }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to start lesson progress. Status: ${response.status}`);
    }
    return response.json();
};

export const submitActivityProgress = async (progressData, token) => {
    if (!progressData || !token) {
        throw new Error('Progress data and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/activity-node-progress/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(progressData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to submit activity progress. Status: ${response.status}`);
    }
    return response.json();
};

export const updateLessonDefinition = async (courseId, lessonId, lessonData, token) => {
    if (!courseId || !lessonId || !token) {
        throw new Error('Course ID, Lesson ID, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Update Lesson API Error (ID ${lessonId}):`, errorData);
        throw new Error(errorData.message || 'Failed to update lesson.');
    }
    return response.json();
};

export const deleteLessonDefinition = async (courseId, lessonId, token) => {
    if (!courseId || !lessonId || !token) {
        throw new Error('Course ID, Lesson ID, and auth token are required for deletion.');
    }
    const response = await fetch(`http://localhost:8080/api/courses/${courseId}/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || 'Failed to delete lesson.');
    }
    return response.json();
};

export const deleteActivityNode = async (activityNodeTypeId, token) => {
    if (!activityNodeTypeId || !token) {
        throw new Error('Activity Node ID and auth token are required for deletion.');
    }
    const response = await fetch(`http://localhost:8080/api/activity-node-types/${activityNodeTypeId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || 'Failed to delete activity node.');
    }
    return response.json();
};

export const updateQuestionOrderForActivityNode = async (activityNodeTypeId, questions, token) => {
    const payload = {
        questions: questions.map(q => ({
            questionId: q.questionId,
            orderIndex: q.orderIndex
        }))
    };
    const response = await fetch(`${API_BASE_URL}/${activityNodeTypeId}/questions/order`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update question order.');
    }
    return await response.json();
};