const API_URL = 'https://task-manager-api-1403.onrender.com/tasks';

const taskList = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');

async function loadTask() {
    try{
        const response = await fetch(API_URL);
        const taskArray = await response.json();

        taskList.innerHTML = '';

        if (taskArray.length === 0) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';

            taskArray.forEach(item => {
                const li = document.createElement('li');

                li.textContent = item.title + ' ';

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '🗑️'

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

async function deleteTaskItem(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadTask(); 
        } else {
            console.error('Error al intentar eliminar el registro en la base de datos.');
        }
    } catch (error) {
        console.error('Error de conexión con la API:', error);
    }
}

loadTask();

const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');

addTaskBtn.addEventListener('click', async () =>{

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

    try{
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
})
