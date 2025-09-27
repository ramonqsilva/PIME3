document.addEventListener('DOMContentLoaded', function() {
    const patientList = document.getElementById('patient-list');

    // Função para carregar a lista de pacientes do localStorage
    function loadPatients() {
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const selectedPatientId = localStorage.getItem('selectedPatientId');
        patientList.innerHTML = ''; // Limpa a lista antes de recarregar
        if (patients.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'Nenhum paciente cadastrado.';
            patientList.appendChild(emptyMessage);
        } else {
            patients.forEach(patient => {
                const patientItem = document.createElement('div');
                patientItem.className = 'patient-item';
                if (patient.id === selectedPatientId) {
                    patientItem.classList.add('selected'); // Adiciona classe para destacar o paciente selecionado
                }
                console.log()
                patientItem.innerHTML = `
                    <div class="patient-info">
                    <!--IMG  ../img/usuario_padrao.png -->
                        <img src="${patient.photo}" alt="${patient.name}">
                        <span>${patient.name}</span>
                    </div>
                    <a href="#" class="delete-button" data-id="${patient.id}">
                        <img src="img/del_icon.png" alt="Deletar" class="delete-icon">
                    </a>
                `;
                patientItem.addEventListener('click', function(event) {
                    if (!event.target.classList.contains('delete-icon')) {
                        localStorage.setItem('selectedPatientId', patient.id);
                        window.location.href = `index.html?id=${patient.id}`;
                    }
                });
                patientList.appendChild(patientItem);
            });

            // Adiciona event listeners para deletar o paciente ao clicar no botão
            document.querySelectorAll('.delete-button').forEach(button => {
                button.addEventListener('click', function(event) {
                    event.preventDefault();
                    const patientId = this.getAttribute('data-id');
                    let patients = JSON.parse(localStorage.getItem('patients')) || [];
                    patients = patients.filter(patient => patient.id !== patientId);
                    localStorage.setItem('patients', JSON.stringify(patients));
                    loadPatients();
                    alert('Paciente deletado com sucesso.');
                });
            });
        }
    }

    // Chama a função para carregar a lista ao carregar a página
    loadPatients();
});
