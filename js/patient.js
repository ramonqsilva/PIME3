document.addEventListener('DOMContentLoaded', function() {
    const patientList = document.getElementById('patient-list');
    const deleteSelectedButton = document.getElementById('deleteSelectedButton');

    if (!patientList) {
        console.error("Erro: Elemento com ID 'patient-list' não foi encontrado.");
        return;
    }

    // Função para carregar a lista de pacientes do localStorage
    function loadPatients() {
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const selectedPatientId = localStorage.getItem('selectedPatientId');
        patientList.innerHTML = '';

        if (patients.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'Nenhum paciente cadastrado.';
            emptyMessage.style.textAlign = 'center';
            patientList.appendChild(emptyMessage);
        } else {
            patients.forEach(patient => {
                const patientItem = document.createElement('div');
                patientItem.className = 'patient-item';
                if (patient.id === selectedPatientId) {
                    patientItem.classList.add('selected');
                }

                // Adiciona o checkbox ao HTML do item
                patientItem.innerHTML = `
                    <div class="patient-checkbox-container">
                        <input type="checkbox" class="patient-checkbox" data-id="${patient.id}">
                    </div>
                    <div class="patient-info">
                        <img src="${patient.photo}" alt="${patient.name}">
                        <span>${patient.name}</span>
                    </div>
                    <div class="delete-container" data-id="${patient.id}">
                        <img src="img/del_icon2.png" alt="Deletar" class="delete-icon">
                    </div>
                `;

                // Adiciona o evento de clique ao item completo (para seleção)
                patientItem.addEventListener('click', function(event) {
                    if (!event.target.closest('.delete-container') && !event.target.closest('.patient-checkbox-container')) {
                        localStorage.setItem('selectedPatientId', patient.id);
                        window.location.href = `index.html`;
                    }
                });
                patientList.appendChild(patientItem);
            });

            // Adiciona event listeners para os botões de exclusão individuais
            document.querySelectorAll('.delete-container').forEach(button => {
                button.addEventListener('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    const patientId = this.getAttribute('data-id');
                    if (confirm("Tem certeza que deseja apagar este paciente?")) {
                        deletePatient(patientId);
                    }
                });
            });
        }
    }

    // Função para deletar um paciente por ID
    function deletePatient(patientId) {
        let patients = JSON.parse(localStorage.getItem('patients')) || [];
        patients = patients.filter(patient => patient.id !== patientId);
        localStorage.setItem('patients', JSON.stringify(patients));
        if (patientId === localStorage.getItem('selectedPatientId')) {
            localStorage.removeItem('selectedPatientId');
        }
        loadPatients();
        alert('Paciente deletado com sucesso.');
    }

    // Evento para o botão de exclusão em massa
    deleteSelectedButton.addEventListener('click', function(event) {
        event.preventDefault();

        const selectedCheckboxes = document.querySelectorAll('.patient-checkbox:checked');
        const idsToDelete = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));

        if (idsToDelete.length === 0) {
            alert("Por favor, selecione um ou mais pacientes para apagar.");
            return;
        }

        if (confirm(`Tem certeza que deseja apagar ${idsToDelete.length} paciente(s) selecionado(s)?`)) {
            let patients = JSON.parse(localStorage.getItem('patients')) || [];
            patients = patients.filter(patient => !idsToDelete.includes(patient.id));
            localStorage.setItem('patients', JSON.stringify(patients));

            const selectedPatientId = localStorage.getItem('selectedPatientId');
            if (selectedPatientId && idsToDelete.includes(selectedPatientId)) {
                localStorage.removeItem('selectedPatientId');
            }

            loadPatients();
            alert(`${idsToDelete.length} paciente(s) apagado(s) com sucesso.`);
        }
    });

    loadPatients();
});