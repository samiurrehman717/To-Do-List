import React, { useState, useEffect, useRef } from 'react';

const Todos = () => {
  const [todos, setTodos] = useState([]);  
  const [newTodo, setNewTodo] = useState(''); 
  const socketRef = useRef(null); // WebSocket ka reference store karne ke liye

  // WebSocket connect karo
  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:8080'); // Apna backend address yahan do

    socketRef.current.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'todosUpdate') {
        setTodos(data.todos);
      }
    };

    socketRef.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

  // Add todo
  const addTodo = () => {
    if (newTodo.trim() === '') return;
    console.log("Added Todo:", newTodo); 

    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);

    // Server ko update bhejo
    socketRef.current.send(JSON.stringify({ type: 'add', todo: newTodo }));

    setNewTodo('');
  };

  // Delete todo
  const deleteTodo = (index) => {
    const updatedTodos = todos.filter((_, i) => i !== index);
    setTodos(updatedTodos);

    // Server ko update bhejo
    socketRef.current.send(JSON.stringify({ type: 'delete', index }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>My Todo List (WebSocket)</h2>

      <input 
        type="text" 
        value={newTodo} 
        onChange={(e) => setNewTodo(e.target.value)} 
        placeholder="Enter a new todo"
      />
      <button onClick={addTodo}>Add</button>

      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            {todo}
            <button 
              onClick={() => deleteTodo(index)} 
              style={{ marginLeft: '10px', color: 'red' }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Todos;
