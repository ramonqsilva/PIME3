document.addEventListener('DOMContentLoaded', function() {
    const patientList = document.getElementById('patient-list');

    // Certifique-se de que o elemento patientList existe antes de continuar
    if (!patientList) {
        console.error("Erro: Elemento com ID 'patient-list' não foi encontrado. Este script deve ser usado apenas em patient.html");
        return; // Sai do script para evitar erros
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

                patientItem.innerHTML = `
                    <div class="patient-info">
                        <img src="${patient.photo}" alt="${patient.name}">
                        <span>${patient.name}</span>
                    </div>
                    <div class="delete-container" data-id="${patient.id}">
                        <img src="img/del_icon.png" alt="Deletar" class="delete-icon">
                    </div>
                `;

                // Adiciona o evento de clique ao item completo (para seleção)
                patientItem.addEventListener('click', function(event) {
                    // Impede que o clique no ícone de delete ative a seleção
                    if (!event.target.closest('.delete-container')) {
                        localStorage.setItem('selectedPatientId', patient.id);
                        window.location.href = `index.html`;
                    }
                });

                patientList.appendChild(patientItem);
            });

            // Adiciona event listeners para os botões de exclusão
            document.querySelectorAll('.delete-container').forEach(button => {
                button.addEventListener('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation(); // <-- AQUI ESTÁ A CORREÇÃO PRINCIPAL
                    const patientId = this.getAttribute('data-id');
                    let patients = JSON.parse(localStorage.getItem('patients')) || [];
                    patients = patients.filter(patient => patient.id !== patientId);
                    localStorage.setItem('patients', JSON.stringify(patients));

                    if (patientId === localStorage.getItem('selectedPatientId')) {
                        localStorage.removeItem('selectedPatientId');
                    }

                    loadPatients();
                });
            });
        }
    }

    loadPatients();
});