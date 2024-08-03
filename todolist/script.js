document.addEventListener('DOMContentLoaded', loadTasks);
document.getElementById('taskForm').addEventListener('submit', addTask);

function loadTasks() 
{
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => addTaskToDOM(task));
    monitorDeadlines();
}

function addTask(event) 
{
    event.preventDefault();
    
    const taskName = document.getElementById('taskName').value;
    const taskDeadline = document.getElementById('taskDeadline').value;
    const taskAdded = new Date().toISOString();
    
    const task = { id: Date.now(), name: taskName, added: taskAdded, deadline: taskDeadline, expired: false };
    addTaskToDOM(task);
    saveTask(task);
    
    document.getElementById('taskForm').reset();
    monitorDeadline(task);
}

function addTaskToDOM(task) 
{
    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');
    li.dataset.id = task.id;
    
    li.innerHTML = `
        <span class="task-name">${task.name}</span>
        <span class="task-times">${new Date(task.added).toLocaleString()} - ${new Date(task.deadline).toLocaleString()}</span>
        <span class="task-status"></span>
        <button class="edit-button">Edit</button>
        <button class="remove-button" onclick="removeTask(${task.id})">Remove</button>
    `;
    
    taskList.appendChild(li);
    updateTaskStatus(li, task.deadline);

    const editButton = li.querySelector('.edit-button');
    editButton.onclick = () => editTask(task.id);
}

function saveTask(task) 
{
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function editTask(id) 
{
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(task => task.id === id);
    const task = tasks[taskIndex];
    
    if (taskIndex > -1) 
    {
        const li = document.querySelector(`li[data-id='${id}']`);
        const taskNameSpan = li.querySelector('.task-name');
        const taskTimesSpan = li.querySelector('.task-times');
        const removeButton = li.querySelector('.remove-button');
        
        removeButton.style.display = 'none';
        
        const taskNameInput = document.createElement('input');
        taskNameInput.type = 'text';
        taskNameInput.value = task.name;
        taskNameInput.classList.add('task-name-input');
        taskNameSpan.replaceWith(taskNameInput);

        const taskDeadlineInput = document.createElement('input');
        taskDeadlineInput.type = 'datetime-local';
        taskDeadlineInput.value = task.deadline.replace(' ', 'T');
        taskDeadlineInput.classList.add('task-deadline-input');
        taskTimesSpan.innerHTML = '';
        taskTimesSpan.appendChild(taskDeadlineInput);
        
        const editButton = li.querySelector('.edit-button');
        editButton.textContent = 'Save';
        
        editButton.onclick = function() 
        {
            task.name = taskNameInput.value;
            task.deadline = taskDeadlineInput.value.replace('T', ' ');
            
            tasks[taskIndex] = task;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            taskNameInput.replaceWith(taskNameSpan);
            taskTimesSpan.innerHTML = `${new Date(task.added).toLocaleString()} - ${new Date(task.deadline).toLocaleString()}`;
            taskNameSpan.textContent = task.name;
            updateTaskStatus(li, task.deadline);
            
            removeButton.style.display = 'inline';
            
            editButton.textContent = 'Edit';
            editButton.onclick = () => editTask(task.id);
        };
    }
}

function removeTask(id) 
{
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const newTasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(newTasks));
    
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    newTasks.forEach(task => addTaskToDOM(task));
}

function updateTaskStatus(li, deadline) 
{
    const deadlineDate = new Date(deadline);
    const now = new Date();

    if (now > deadlineDate) 
    {
        li.classList.add('expired');
    }
    else
    {
        li.classList.remove('expired');
    }
}

function monitorDeadline(task) 
{
    const taskElement = document.querySelector(`li[data-id='${task.id}']`);
    const deadline = new Date(task.deadline);
    const interval = setInterval(() => {
        const now = new Date();
        if (now > deadline) 
        {
            taskElement.classList.add('expired');
            clearInterval(interval);
        }
    }, 1000);
}

function monitorDeadlines() 
{
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => monitorDeadline(task));
}
