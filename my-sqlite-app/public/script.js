const tbody = document.querySelector('#usersTable tbody');

async function fetchUsers() {
    const res = await fetch('/users');
    const users = await res.json();
    tbody.innerHTML = '';
    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.id}</td>
            <td><input value="${u.name}" id="name-${u.id}"></td>
            <td><input value="${u.email}" id="email-${u.id}"></td>
            <td>
                <button onclick="updateUser(${u.id})">Update</button>
                <button onclick="deleteUser(${u.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function addUser() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    await fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
    });
    fetchUsers();
}

async function updateUser(id) {
    const name = document.getElementById(`name-${id}`).value;
    const email = document.getElementById(`email-${id}`).value;
    await fetch(`/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
    });
    fetchUsers();
}

async function deleteUser(id) {
    await fetch(`/users/${id}`, { method: 'DELETE' });
    fetchUsers();
}

// Load users on page load
fetchUsers();
