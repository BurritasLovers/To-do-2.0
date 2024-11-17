let currentUser = null;
let tasks = [];
let categories = ["Trabajo", "Personal"];

// DOM Elements
const userRegistration = document.getElementById('user-registration');
const userLogin = document.getElementById('user-login');
const taskManagement = document.getElementById('task-management');
const userName = document.getElementById('user-name');
const registrationForm = document.getElementById('registration-form');
const loginForm = document.getElementById('login-form');
const taskForm = document.getElementById('task-form');
const categoryForm = document.getElementById('category-form');
const taskList = document.getElementById('task-list');
const categoryList = document.getElementById('category-list');
const categorySelect = document.getElementById('task-category');
const toLoginButton = document.getElementById('to-login');
const toRegisterButton = document.getElementById('to-register');
const logoutButton = document.getElementById('logout-btn');
const planningCategorySelect = document.getElementById('planning-category'); // Añadido
const calendar = document.getElementById('calendar');

// Event Listeners
registrationForm.addEventListener('submit', registerUser);
loginForm.addEventListener('submit', loginUser);
taskForm.addEventListener('submit', createTask);
categoryForm.addEventListener('submit', addCategory);
toLoginButton.addEventListener('click', showLogin);
toRegisterButton.addEventListener('click', showRegistration);
logoutButton.addEventListener('click', logout);
planningCategorySelect.addEventListener('change', renderPlanning); // Añadido

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => openTab(button.dataset.tab));
});

// Mostrar pantalla de inicio de sesión
function showLogin() {
    userRegistration.classList.add('hidden');
    userLogin.classList.remove('hidden');
}

// Mostrar pantalla de registro
function showRegistration() {
    userRegistration.classList.remove('hidden');
    userLogin.classList.add('hidden');
}

// User Registration
function registerUser(e) {
    e.preventDefault();
    currentUser = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    // Guardar el usuario registrado en LocalStorage
    localStorage.setItem("user", JSON.stringify(currentUser));

    alert("Usuario registrado exitosamente");
    registrationForm.reset();
}

// User Login
function loginUser(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser && storedUser.email === email && storedUser.password === password) {
        // Guardar el nombre de usuario en una cookie
        document.cookie = `username=${storedUser.name};path=/;max-age=86400`;  // 1 día de duración

        // Mostrar la sección de gestión de tareas
        userLogin.classList.add("hidden");
        taskManagement.classList.remove("hidden");
        userName.textContent = storedUser.name;
    } else {
        alert("Correo electrónico o contraseña incorrectos");
    }
}

// Verificar si el usuario está autenticado
const username = getCookie("username");
if (username) {
    userRegistration.classList.add("hidden");
    userLogin.classList.add("hidden");
    taskManagement.classList.remove("hidden");
    userName.textContent = username;
} else {
    userRegistration.classList.remove('hidden');
    userLogin.classList.remove('hidden');
    taskManagement.classList.add('hidden');
}

// Cerrar sesión
function logout() {
    // Eliminar la cookie de usuario
    document.cookie = "username=;path=/;max-age=0";
    // Mostrar la pantalla de inicio de sesión
    showLogin();
}

// Task Management
function createTask(e) {
    e.preventDefault();
    const newTask = {
        id: tasks.length + 1,
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        subtasks: document.getElementById('task-subtasks').value.split(',').map(s => s.trim()), // Corrección aquí
        responsible: document.getElementById('task-responsible').value,
        endDate: document.getElementById('task-end-date').value,
        category: document.getElementById('task-category').value,
        startDate: new Date().toISOString(),
        state: 'started',
        importance: document.getElementById('task-importance').value
    };
    tasks.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(tasks));  // Guardar tareas en LocalStorage
    renderTasks();
    taskForm.reset();
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        taskElement.innerHTML = `
            <h3>${task.title}</h3>
            <p><strong>Description:</strong> ${task.description}</p>
            <p><strong>Subtasks:</strong> ${task.subtasks.join(', ')}</p>
            <p><strong>Responsible:</strong> ${task.responsible}</p>
            <p><strong>Category:</strong> ${task.category}</p>
            <p><strong>Importance:</strong> ${task.importance}</p>
            <p><strong>State:</strong> ${task.state}</p>
            <p><strong>Start Date:</strong> ${new Date(task.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> ${new Date(task.endDate).toLocaleDateString()}</p>
            <div class="task-actions">
                <select class="task-state" ${task.state === 'completed' ? 'disabled' : ''}>
                    <option value="started" ${task.state === 'started' ? 'selected' : ''}>Started</option>
                    <option value="in progress" ${task.state === 'in progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${task.state === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="postponed" ${task.state === 'postponed' ? 'selected' : ''}>Postponed</option>
                </select>
                <button class="delete-task">Delete</button>
            </div>
        `;
        
        const stateSelect = taskElement.querySelector('.task-state');
        stateSelect.addEventListener('change', () => updateTaskState(task.id, stateSelect.value));
        
        const deleteButton = taskElement.querySelector('.delete-task');
        deleteButton.addEventListener('click', () => deleteTask(task.id));
        
        taskList.appendChild(taskElement);
    });
}

function updateTaskState(taskId, newState) {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.state !== 'completed') {
        task.state = newState;
        renderTasks();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    renderTasks();
}

// Category Management
function addCategory(e) {
    e.preventDefault();
    const newCategory = document.getElementById('new-category').value;
    if (categories.length < 10 && !categories.includes(newCategory)) {
        categories.push(newCategory);
        renderCategories();
        updateCategorySelect();
        document.getElementById('new-category').value = '';
    } else {
        alert('Maximum number of categories reached or category already exists');
    }
}

function renderCategories() {
    categoryList.innerHTML = '';
    categories.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category;
        categoryList.appendChild(li);
    });
}

function updateCategorySelect() {
    categorySelect.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    
    planningCategorySelect.innerHTML = '<option value="all">All</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        planningCategorySelect.appendChild(option);
    });
}

// Planning Management
function renderPlanning() {
    const selectedCategory = planningCategorySelect.value;
    calendar.innerHTML = '';

    const filteredTasks = selectedCategory === 'all' ? tasks : tasks.filter(task => task.category === selectedCategory);

    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'planning-task';
        taskElement.draggable = true;
        taskElement.innerHTML = `
            <h4>${task.title}</h4>
            <p>${task.description}</p>
            <p>Due: ${new Date(task.endDate).toLocaleDateString()}</p>
        `;
        taskElement.addEventListener('dragstart', () => taskElement.classList.add('dragging'));
        taskElement.addEventListener('dragend', () => taskElement.classList.remove('dragging'));
        calendar.appendChild(taskElement);
    });
}

// Tab Management
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(tabName).classList.remove('hidden');
    
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Helper Function to Get Cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Initialize
renderCategories();
updateCategorySelect();
renderPlanning();
