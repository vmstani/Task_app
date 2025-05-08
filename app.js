// Función que se ejecuta al cargar la página
window.onload = function() {
  // Solicitar nombre cada vez que se carga la página
  const userName = prompt("¡Bienvenido/a! Por favor ingresa tu nombre:") || "Usuario";
  
  // Mostrar mensaje de bienvenida
  document.getElementById("welcome").textContent = 
    `Bienvenido/a ${userName}. ¡Gracias por usar nuestra aplicación de tareas!`;
  
  // Inicializar el resto de la aplicación
  setCurrentDateTime();
  document.getElementById('formTask').addEventListener('submit', saveTask);
  getTasks();
};



// Función para guardar tareas
function saveTask(e) {
  e.preventDefault();
  
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const date = document.getElementById('taskDate').value;
  const time = document.getElementById('taskTime').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  if (!title || !date || !time) {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }

  const dateTime = `${date}T${time}`;
  const formattedDateTime = formatDateTime(dateTime);

  const task = { 
    title, 
    description,
    dateTime: formattedDateTime,
    rawDateTime: dateTime
  };

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  
  // Verificar si es una edición
  const isEdit = submitBtn.textContent === 'Actualizar';
  const originalTitle = submitBtn.dataset.originalTitle;
  
  if (isEdit) {
    // Eliminar la tarea original si el título cambió
    if (originalTitle && originalTitle !== title) {
      tasks = tasks.filter(t => t.title !== originalTitle);
    } else {
      // Si el título no cambió, eliminar la versión anterior
      tasks = tasks.filter(t => t.title !== title);
    }
    
    // Restaurar el botón a su estado original
    submitBtn.textContent = 'Guardar';
    submitBtn.classList.remove('btn-warning');
    submitBtn.classList.add('btn-primary');
    delete submitBtn.dataset.originalTitle;
  } else {
    // Verificar si ya existe una tarea con el nuevo título
    const exists = tasks.some(t => t.title === title);
    if (exists) {
      if (!confirm('Ya existe una tarea con este título. ¿Deseas reemplazarla?')) {
        return;
      }
      tasks = tasks.filter(t => t.title !== title);
    }
  }
  
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  
  getTasks();
  document.getElementById('formTask').reset();
  setCurrentDateTime();
}

// Función para formatear fecha y hora
function formatDateTime(dateTimeString) {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateTimeString).toLocaleDateString('es-ES', options);
}

function deleteTask(title) {
  if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
    return;
  }
  
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks = tasks.filter(task => task.title !== title);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  getTasks();
}

// Función para mostrar tareas
function getTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.sort((a, b) => new Date(b.rawDateTime) - new Date(a.rawDateTime));
  
  const tasksView = document.getElementById('tasks');
  
  if (tasks.length === 0) {
    tasksView.innerHTML = '<p class="text-muted">No hay tareas registradas</p>';
    return;
  }

  tasksView.innerHTML = tasks.map(task => `
    <div class="task-card p-3 mb-3 bg-white rounded shadow-sm" data-title="${task.title}">
      <div class="d-flex justify-content-between align-items-center">
        <h6 class="mb-1 font-weight-bold">${task.title}</h6>
        <div>
          <button onclick="editTask('${task.title}')" class="action-btn edit-btn mr-2">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="deleteTask('${task.title}')" class="action-btn delete-btn">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      <p class="mb-1 text-muted small">
        <i class="far fa-calendar-alt mr-1"></i>
        ${task.dateTime}
      </p>
      <p class="mb-1">${task.description || 'Sin descripción'}</p>
    </div>
  `).join('');
}


// Manejo de edición de tareas
function editTask(title) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const taskToEdit = tasks.find(task => task.title === title);
  
  if (taskToEdit) {
    // Rellenar el formulario con los datos de la tarea
    document.getElementById('title').value = taskToEdit.title;
    document.getElementById('description').value = taskToEdit.description || '';
    
    // Convertir la fecha/hora al formato correcto para los inputs
    const dateTime = new Date(taskToEdit.rawDateTime);
    const dateStr = dateTime.toISOString().split('T')[0];
    const timeStr = `${dateTime.getHours().toString().padStart(2, '0')}:${dateTime.getMinutes().toString().padStart(2, '0')}`;
    
    document.getElementById('taskDate').value = dateStr;
    document.getElementById('taskTime').value = timeStr;
    
    // Cambiar el texto del botón de guardar
    const submitBtn = document.querySelector('#formTask button[type="submit"]');
    submitBtn.textContent = 'Actualizar';
    submitBtn.classList.remove('btn-primary');
    submitBtn.classList.add('btn-warning');
    
    // Guardar el título original para referencia
    submitBtn.dataset.originalTitle = title;
    
    // Desplazarse al formulario
    document.getElementById('title').focus();
  }
}
// Establecer fecha y hora actual al cargar
function setCurrentDateTime() {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  document.getElementById('taskDate').value = date;
  document.getElementById('taskTime').value = time;
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  setCurrentDateTime();
  document.getElementById('formTask').addEventListener('submit', saveTask);
  getTasks();
});

// Guardar tareas (solo duran mientras la pestaña está abierta)
sessionStorage.setItem('tasks', JSON.stringify(tasks));

// Leer tareas
const tasks = JSON.parse(sessionStorage.getItem('tasks')) || [];