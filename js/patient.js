document.addEventListener('DOMContentLoaded', function() {
    const patientList = document.getElementById('patient-list');
    const deleteSelectedButton = document.getElementById('deleteSelectedButton');
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('editForm');
    const modalCloseButton = document.querySelector('#edit-modal .close-button');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // Elementos de foto no modal de edição
    const editPhotoInput = document.getElementById('edit-patientPhoto');
    const editProfileImage = document.getElementById('edit-profile-picture');

    // NOVO: Referência ao botão Cancelar
    const cancelEditButton = document.getElementById('cancelEditButton');

    if (!patientList) return;

    // Função auxiliar para exibir/ocultar o botão de exclusão em massa
    function toggleDeleteButtonVisibility() {
        const selectedCheckboxes = document.querySelectorAll('.patient-checkbox:checked');
        deleteSelectedButton.classList.toggle('hidden', selectedCheckboxes.length === 0);
    }

    // Função para filtrar e carregar a lista de pacientes do localStorage
    function loadPatients(searchTerm = '') {
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const selectedPatientId = localStorage.getItem('selectedPatientId');
        patientList.innerHTML = '';

        const filteredPatients = patients.filter(patient =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredPatients.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = searchTerm ? 'Nenhum paciente encontrado com este nome.' : 'Nenhum paciente cadastrado.';
            emptyMessage.style.textAlign = 'center';
            patientList.appendChild(emptyMessage);
        } else {
            filteredPatients.forEach(patient => {
                const patientItem = document.createElement('div');
                patientItem.className = 'patient-item';
                patientItem.classList.toggle('selected', patient.id === selectedPatientId);

                patientItem.innerHTML = `
                    <div class="patient-checkbox-container">
                        <input type="checkbox" class="patient-checkbox" data-id="${patient.id}">
                    </div>
                    <div class="patient-info">
                        <img src="${patient.photo}" alt="${patient.name}">
                        <span>${patient.name}</span>
                    </div>
                    <div class="actions-container">
                        <div class="edit-container" data-id="${patient.id}">
                            <img src="img/edit_icon.png" alt="Editar" class="edit-icon">
                        </div>
                        <div class="delete-container" data-id="${patient.id}">
                            <img src="img/del_icon2.png" alt="Deletar" class="delete-icon">
                        </div>
                    </div>
                `;

                patientItem.addEventListener('click', function(event) {
                    if (!event.target.closest('.actions-container') && !event.target.closest('.patient-checkbox')) {
                        localStorage.setItem('selectedPatientId', patient.id);
                        window.location.href = `index.html`;
                    }
                });

                patientItem.querySelector('.patient-checkbox').addEventListener('click', function(event) {
                    event.stopPropagation();
                    toggleDeleteButtonVisibility();
                });

                patientList.appendChild(patientItem);
            });

            // Adiciona listeners para os botões de EDITAR
            document.querySelectorAll('.edit-container').forEach(button => {
                button.addEventListener('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    const patientId = this.getAttribute('data-id');
                    openEditModal(patientId);
                });
            });

            // Adiciona listeners para os botões de DELETAR (individual)
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

    // --- Lógica de Edição ---
    function openEditModal(patientId) {
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const patient = patients.find(p => p.id === patientId);

        if (patient) {
            document.getElementById('edit-patient-id').value = patient.id;

            editProfileImage.src = patient.photo || 'img/user_icon2.png';

            document.getElementById('edit-name').value = patient.name;
            document.getElementById('edit-gender').value = patient.gender;
            document.getElementById('edit-dob').value = patient.dob;
            document.getElementById('edit-rg').value = patient.rg;
            document.getElementById('edit-cpf').value = patient.cpf;
            document.getElementById('edit-responsible').value = patient.responsible;
            document.getElementById('edit-phone1').value = patient.phone1;
            document.getElementById('edit-phone2').value = patient.phone2;
            document.getElementById('edit-email').value = patient.email;
            document.getElementById('edit-address').value = patient.address.address;
            document.getElementById('edit-address-number').value = patient.address.number;
            document.getElementById('edit-neighborhood').value = patient.address.neighborhood;
            document.getElementById('edit-city').value = patient.address.city;
            document.getElementById('edit-state').value = patient.address.state;
            document.getElementById('edit-zipcode').value = patient.address.zipCode;

            editModal.style.display = "block";
        }
    }

    // Listener para pré-visualizar a nova foto selecionada no modal
    editPhotoInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                editProfileImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Lógica para fechar o modal (Botão X e fora do modal)
    modalCloseButton.addEventListener('click', () => { editModal.style.display = "none"; });
    window.onclick = (event) => { if (event.target === editModal) editModal.style.display = "none"; };

    // NOVO: Lógica para fechar o modal ao clicar em Cancelar
    cancelEditButton.addEventListener('click', () => {
        editModal.style.display = "none";
    });

    // Lógica para salvar a edição do paciente (INCLUINDO A FOTO)
    editForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const patientId = document.getElementById('edit-patient-id').value;
        let patients = JSON.parse(localStorage.getItem('patients')) || [];
        const patientIndex = patients.findIndex(p => p.id === patientId);

        if (patientIndex !== -1) {

            const saveChanges = (newPhotoData) => {
                // Atualiza todos os dados
                patients[patientIndex].name = document.getElementById('edit-name').value;
                patients[patientIndex].gender = document.getElementById('edit-gender').value;
                patients[patientIndex].dob = document.getElementById('edit-dob').value;
                patients[patientIndex].rg = document.getElementById('edit-rg').value;
                patients[patientIndex].cpf = document.getElementById('edit-cpf').value;
                patients[patientIndex].responsible = document.getElementById('edit-responsible').value;
                patients[patientIndex].phone1 = document.getElementById('edit-phone1').value;
                patients[patientIndex].phone2 = document.getElementById('edit-phone2').value;
                patients[patientIndex].email = document.getElementById('edit-email').value;
                patients[patientIndex].address.address = document.getElementById('edit-address').value;
                patients[patientIndex].address.number = document.getElementById('edit-address-number').value;
                patients[patientIndex].address.neighborhood = document.getElementById('edit-neighborhood').value;
                patients[patientIndex].address.city = document.getElementById('edit-city').value;
                patients[patientIndex].address.state = document.getElementById('edit-state').value;
                patients[patientIndex].address.zipCode = document.getElementById('edit-zipcode').value;

                if (newPhotoData) {
                    patients[patientIndex].photo = newPhotoData;
                }

                localStorage.setItem('patients', JSON.stringify(patients));
                editModal.style.display = "none";
                loadPatients(searchInput.value); // Recarrega a lista
                alert('Paciente atualizado com sucesso!');
            };

            if (editPhotoInput.files.length > 0) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    saveChanges(e.target.result);
                };
                reader.readAsDataURL(editPhotoInput.files[0]);
            } else {
                saveChanges(null);
            }
        }
    });

    // --- Lógica de Exclusão e Busca ---
    function deletePatient(patientId) {
        let patients = JSON.parse(localStorage.getItem('patients')) || [];
        patients = patients.filter(patient => patient.id !== patientId);
        localStorage.setItem('patients', JSON.stringify(patients));
        if (patientId === localStorage.getItem('selectedPatientId')) {
            localStorage.removeItem('selectedPatientId');
        }
        loadPatients(searchInput.value);
        toggleDeleteButtonVisibility();
        alert('Paciente deletado com sucesso.');
    }

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

            loadPatients(searchInput.value);
            toggleDeleteButtonVisibility();
            alert(`${idsToDelete.length} paciente(s) apagado(s) com sucesso.`);
        }
    });

    // Lógica da Barra de Busca
    searchButton.addEventListener('click', () => {
        loadPatients(searchInput.value);
    });
    searchInput.addEventListener('input', () => {
        loadPatients(searchInput.value);
    });

    loadPatients(); // Carrega a lista inicial
    toggleDeleteButtonVisibility(); // Verifica o estado inicial do botão de deletar
});