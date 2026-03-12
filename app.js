const API_URL = 'https://task-manager-api-1403.onrender.com';
const lightColors = ['#ffcdd2', '#e1bee7', '#bbdefb', '#c8e6c9', '#fff9c4', '#ffecb3', '#b2ebf2'];

// ==========================================
// ELEMENTOS DEL DOM
// ==========================================
const authSection = document.getElementById('authSection');
const taskSection = document.getElementById('taskSection');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const authMessage = document.getElementById('authMessage');
const logoutBtn = document.getElementById('logoutBtn');

const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');

// ==========================================
// LÓGICA DE AUTENTICACIÓN
// ==========================================
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        authSection.style.display = 'none';
        taskSection.style.display = 'block';
        loadTask();
    } else {
        authSection.style.display = 'block';
        taskSection.style.display = 'none';
    }
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

registerBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!username || !password) return authMessage.textContent = 'Llena ambos campos.';

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        
        if (response.ok) {
            authMessage.style.color = '#4CAF50';
            authMessage.textContent = 'Registro exitoso. Inicia sesión.';
        } else {
            authMessage.style.color = '#ff5252';
            authMessage.textContent = data.error;
        }
    } catch (error) {
        authMessage.textContent = 'Error de conexión.';
    }
});

loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!username || !password) return authMessage.textContent = 'Llena ambos campos.';

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            usernameInput.value = '';
            passwordInput.value = '';
            authMessage.textContent = '';
            checkAuth();
        } else {
            authMessage.style.color = '#ff5252';
            authMessage.textContent = data.error;
        }
    } catch (error) {
        authMessage.textContent = 'Error de conexión.';
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    checkAuth();
});

// ==========================================
// LÓGICA DE TAREAS
// ==========================================
async function loadTask() {
    try {
        const response = await fetch(`${API_URL}/tasks`, { headers: getAuthHeaders() });
        
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            checkAuth();
            return;
        }

        const taskArray = await response.json();
        taskList.innerHTML = '';

        if (taskArray.length === 0) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';

            taskArray.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.title + ' ';

                const randomIndex = Math.floor(Math.random() * lightColors.length);
                li.style.backgroundColor = lightColors[randomIndex];

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '🗑️';

                deleteBtn.addEventListener('click', async () => {
                    await deleteTaskItem(item.id);
                });

                li.appendChild(deleteBtn);
                taskList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error al conectar con la API:', error);
    }
}

addTaskBtn.addEventListener('click', async () => {
    const newTaskTitle = taskInput.value.trim();
    const newTaskCompleted = false;

    if (newTaskTitle === ''){
        alert('Por favor, escribe el nombre de la tarea');
        return;
    }

    const taskData = {
        title: newTaskTitle,
        completed: newTaskCompleted
    };

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(taskData)
        });

        if (response.ok) {
            taskInput.value = '';
            loadTask();
        } else {
            console.error('Hubo un error al guardar');
        }
    } catch (error) {
        console.error('No se pudo conectar con la API:', error)
    }
});

async function deleteTaskItem(id) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            loadTask(); 
        } else {
            console.error('Error al intentar eliminar el registro.');
        }
    } catch (error) {
        console.error('Error de conexión con la API:', error);
    }
}

// Inicialización
checkAuth();