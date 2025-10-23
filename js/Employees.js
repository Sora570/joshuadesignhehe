// Employees Management JavaScript

let employees = [];

// Tab switching for employee modal
function switchEmployeeTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab content
    const targetTab = document.getElementById(tabName + 'InfoTab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Activate corresponding tab button
    const targetButton = document.querySelector(`[onclick="switchEmployeeTab('${tabName}')"]`);
    if (targetButton) {
        targetButton.classList.add('active');
    }
}

// Load employees list
async function loadEmployees() {
    try {
        const response = await fetch('db/employees_get.php');
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error('HTTP ' + response.status + ': ' + errorText);
        }
        
        const data = await response.json();
        
        // Check for array of employees
        if (Array.isArray(data)) {
            employees = data;
        } else if (data.employees) {
            employees = data.employees;
        } else if (data.error) {
            throw new Error(data.error);
        } else {
            employees = [];
        }
        
        renderEmployeesTable();
    } catch (error) {
        console.error('Error loading employees:', error);
        showToast('Failed to load employees: ' + error.message, 'error');
        employees = [];
        renderEmployeesTable();
    }
}

// Toast notifications helper
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast') || createToastElement();
    const toastMessage = toast.querySelector('#toast-message');
    
    if (toastMessage) {
        toastMessage.innerText = message;
        toast.className = 'toast show';
        
        if (type === 'error') {
            toast.classList.add('toast-error');
        } else if (type === 'success') {
            toast.classList.add('toast-success');
        }
        
        setTimeout(() => {
            toast.className = toast.className.replace('show', '');
        }, 4000);
    }
}

function createToastElement() {
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.innerHTML = '<span id="toast-message"></span>';
    document.body.appendChild(toast);
    return toast;
}

// Render employees table
function renderEmployeesTable() {
    const tbody = document.getElementById('employeesTableBody');
    if (!tbody) return;
    
    if (employees.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: #6b7280; padding: 2rem;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                        <div style="font-size: 48px;">👥</div>
                        <div>No employees found</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = employees.map(emp => `
        <tr>
            <td><strong>${emp.userID}</strong></td>
            <td>${emp.username}</td>
            <td><code>${emp.employee_id || 'N/A'}</code></td>
            <td>
                <span class="role-badge role-${emp.role}">
                    ${emp.role.toUpperCase()}
                </span>
            </td>
            <td>${formatDate(emp.createdAt || emp.created_at)}</td>
            <td>${formatDate(emp.lastLogin)}</td>
            <td>
                <span class="status-badge ${emp.status || 'Not Started'}">
                    ${emp.status || 'Not Started'}
                </span>
            </td>
            <td>
                <button onclick="editEmployee(${emp.userID})" class="btn-small btn-primary">
                    Edit
                </button>
                <button onclick="deleteEmployee(${emp.userID})" class="btn-small btn-danger">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Format date display
function formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Show add employee modal
function showAddEmployeeModal() {
    const modal = document.getElementById('addEmployeeModal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('addEmployeeForm').reset();
    }
}

// Close add employee modal
function closeAddEmployeeModal() {
    const modal = document.getElementById('addEmployeeModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Handle add employee form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addEmployeeForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Basic Information
            const firstName = document.getElementById('employeeFirstName').value;
            const lastName = document.getElementById('employeeLastName').value;
            const email = document.getElementById('employeeEmail').value;
            const phone = document.getElementById('employeePhone').value;
            const address = document.getElementById('employeeAddress').value;
            
            // Login Information
            const username = document.getElementById('employeeUsername').value;
            const password = document.getElementById('employeePassword').value;
            const role = document.getElementById('employeeRole').value;
            const pin = document.getElementById('employeePin').value;
            const employeeId = document.getElementById('employeeId').value;
            
            try {
                const response = await fetch('db/employees_add.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&address=${encodeURIComponent(address)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&role=${encodeURIComponent(role)}&pin=${encodeURIComponent(pin)}&employeeId=${encodeURIComponent(employeeId)}`
                });
                
                if (response.ok) {
                    alert('Employee added successfully!');
                    closeAddEmployeeModal();
                    loadEmployees(); // Refresh list
                } else {
                    const error = await response.text();
                    alert('Failed to add employee: ' + error);
                }
            } catch (error) {
                console.error('Error adding employee:', error);
                alert('Error adding employee');
            }
        });
    }
});

// Edit employee (placeholder)
function editEmployee(userID) {
    alert('Edit employee functionality coming soon');
}

// Delete employee
async function deleteEmployee(userID) {
    if (!confirm('Are you sure you want to delete this employee?')) {
        return;
    }
    
    try {
        const response = await fetch('db/employees_delete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `userID=${userID}`
        });
        
        if (response.ok) {
            alert('Employee deleted successfully!');
            loadEmployees(); // Refresh list
        } else {
            alert('Failed to delete employee');
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Error deleting employee');
    }
}

// Employee filtering functions
function initEmployeeFilters() {
    const searchInput = document.getElementById('employeeSearch');
    const roleFilter = document.getElementById('employeeRoleFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterEmployees);
    }
    
    if (roleFilter) {
        roleFilter.addEventListener('change', filterEmployees);
    }
}

function filterEmployees() {
    const searchTerm = document.getElementById('employeeSearch')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('employeeRoleFilter')?.value || '';
    
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.username.toLowerCase().includes(searchTerm) ||
                            String(emp.employee_id || '').toLowerCase().includes(searchTerm);
        const matchesRole = !roleFilter || emp.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });
    
    // Temporarily store original and render filtered
    const originalEmployees = employees;
    employees = filteredEmployees;
    renderEmployeesTable();
    employees = originalEmployees; // Restore original data
}

// Initialize on document ready
document.addEventListener('DOMContentLoaded', function() {
    initEmployeeFilters();
});

// Expose functions globally
window.showAddEmployeeModal = showAddEmployeeModal;
window.closeAddEmployeeModal = closeAddEmployeeModal;
window.loadEmployees = loadEmployees;
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.switchEmployeeTab = switchEmployeeTab;
