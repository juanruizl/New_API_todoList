import React, { useEffect, useState } from "react";

// Crea el usuario 'juanru'
const crearUsuario = () => {
    return fetch('https://playground.4geeks.com/todo/users/juanru', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'juanru' })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Error al crear el usuario');
        }
        return res.json();
    })
    .then(data => {
        console.log("Usuario creado: ", data);
        return data;
    })
    .catch(error => console.log('Error al crear usuario ==> ', error));
};

// Elimina el usuario 'juanru'
const eliminarUsuario = () => {
    return fetch("https://playground.4geeks.com/todo/users/juanru", {
        method: 'DELETE'
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Error al eliminar el usuario');
        }
        return true;
    })
    .then(() => console.log("Usuario eliminado"))
    .catch(error => console.log('Error al eliminar usuario ==> ', error));
};

// Lee los datos de 'juanru'
const leerUsuario = () => {
    return fetch('https://playground.4geeks.com/todo/users/juanru')
    .then(resultado => {
        if (!resultado.ok) {
            throw new Error('Usuario no encontrado');
        }
        return resultado.json();
    })
    .then(data => {
        return data.todos || [];
    })
    .catch(error => {
        console.log('Error al leer usuario ==> ', error);
        return null;
    });
};

// Componente principal que gestiona la lista de tareas
const Home = () => {
    const [newEntry, setNewEntry] = useState(''); // Entrada de nueva tarea
    const [toDoList, setToDoList] = useState([]); // Lista de tareas
    const [estado, setEstado] = useState(false); // Control del botón eliminar
    const conteo = toDoList.length; // Número de tareas pendientes

    // Crea una nueva tarea
    const crearToDo = (item) => {
        fetch('https://playground.4geeks.com/todo/todos/juanru', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "label": item,
                "is_done": false
            })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Error al crear la tarea');
            }
            return res.json();
        })
        .then(data => {
            const nuevaLista = [...toDoList, { id: data.id, label: item }];
            setToDoList(nuevaLista); // Añade la nueva tarea a la lista
            console.log(data);
        })
        .catch(error => console.log('Error al crear ToDo ==> ', error));
    };

    // Elimina una tarea mediante su ID
    const eliminarToDo = (id) => {
        fetch(`https://playground.4geeks.com/todo/todos/${id}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Error al eliminar el ToDo');
            }
            return leerUsuario(); // Actualiza los datos del usuario tras eliminar el ToDo
        })
        .then(data => setToDoList(data))
        .catch(error => console.log('Error ==> ', error));
    };

    // Envío del formulario para agregar una tarea
    const onSubmit = (e) => {
        e.preventDefault();
        if (newEntry.trim() === "") return; // No agregar si está vacío
        crearToDo(newEntry);
        setNewEntry(''); // Limpia el campo de entrada
        console.log("onSubmit");
    };

    // Elimina una tarea de la lista
    const eliminarElemento = (index) => {
        const item = toDoList[index];
        eliminarToDo(item.id);  // Pasa el ID del item a eliminar
        const result = toDoList.filter((_, i) => i !== index);
        setToDoList(result); // Actualiza la lista sin el elemento eliminado
        console.log("onDelete");
    };

    // Elimina todas las tareas y al usuario
    const clearToDoList = () => {
        toDoList.forEach(item => {
            eliminarToDo(item.id); // Elimina cada tarea individualmente
        });
        setToDoList([]); // Limpia la lista local
        eliminarUsuario(); // Elimina el usuario
    };

    // Recupera los datos del usuario
    const fetchData = () => {
        leerUsuario()
        .then(data => {
            console.log(data);
            if (data && Array.isArray(data)) {
                setToDoList(data); // Si el usuario existe, carga sus tareas
            } else {
                crearUsuario()
                .then(() => leerUsuario())
                .then(nuevaLista => setToDoList(nuevaLista.todos)); // Carga las tareas del nuevo usuario
            }
        })
        .catch(error => console.log('Error al obtener los datos', error));
    };

    // Carga los datos
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="container w-75 text-center mt-5">
            <h1 className="display-4" style={{ fontSize: "35px", paddingBottom: "20px", color: "#5a5a5a" }}>Mi To-Do List</h1>
            <div className="container-flex bg-light border rounded shadow-lg p-3">
                <form onSubmit={onSubmit}>
                    <div className="d-flex justify-content-between border-bottom p-3">
                        <input
                            onChange={(e) => setNewEntry(e.target.value)}
                            value={newEntry}
                            type="text"
                            className="form-control mb-3 me-2"
                            placeholder="Añadir una nueva tarea"
                            id="newTodoInput"
                            style={{ fontSize: "18px", height: "45px" }}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary mb-3"
                        >
                            Agregar tarea
                        </button>
                    </div>
                </form>
                <ul className="list-group list-group-flush">
                    {toDoList.length === 0 ? (
                        <p className="text-center pt-4" style={{ fontSize: "18px", color: "#6c757d" }}>No hay tareas disponibles</p>
                    ) : (
                        toDoList.map((item, index) => (
                            <li
                                key={index}
                                className="list-group-item bg-white d-flex justify-content-between align-items-center mb-2"
                                style={{ fontSize: "20px", padding: "15px 10px", cursor: "pointer" }}
                            >
                                {item.label}
                                <button onClick={() => eliminarElemento(index)}>Eliminar</button>
                            </li>
                        ))
                    )}
                </ul>
                <div className="pt-4 d-flex justify-content-between align-items-center">
                    <span className="text-muted">Tareas pendientes: {conteo}</span>
                    <button className="btn btn-danger" onClick={clearToDoList}>Limpiar lista</button>
                </div>
            </div>
        </div>
    );
};

export default Home;
