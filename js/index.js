document.addEventListener('DOMContentLoaded', function() {
    // Elementos da página principal
    const patientPhoto = document.getElementById('patientPhoto');
    const patientNameElement = document.getElementById('patientName');
    const patientAgeElement = document.getElementById('patientAge');
    const patientDOBElement = document.getElementById('patientDOB');
    const contentLink = document.getElementById('paciente_data');

    // Elementos do Modal de Edição
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('editForm');
    const modalCloseButton = document.querySelector('#edit-modal .close-button');
    const cancelEditButton = document.getElementById('cancelEditButton');
    const editPhotoInput = document.getElementById('edit-patientPhoto');
    const editProfileImage = document.getElementById('edit-profile-picture');

    // Caminho da imagem padrão
    const defaultUserIcon = 'img/user_icon.png';
    const defaultModalIcon = 'img/user_icon2.png';

    let selectedPatient = null; // Armazenará os dados completos do paciente

    function loadSelectedPatient() {
        const selectedPatientId = localStorage.getItem('selectedPatientId');

        if (!selectedPatientId) {
            patientPhoto.src = defaultUserIcon;
            patientNameElement.textContent = 'Nome: Nenhum Paciente Selecionado';
            patientAgeElement.textContent = 'Idade: -';
            patientDOBElement.textContent = 'Data de Nascimento: -';
            return;
        }

        try {
            const patients = JSON.parse(localStorage.getItem('patients')) || [];
            const patient = patients.find(p => String(p.id) === String(selectedPatientId));
            selectedPatient = patient; // Armazena para uso no modal

            if (patient) {
                patientPhoto.src = patient.photo || defaultUserIcon;
                patientNameElement.textContent = `Nome: ${patient.name}`;

                const birthDate = new Date(patient.dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                patientAgeElement.textContent = `Idade: ${age} ano(s)`;
                patientDOBElement.textContent = `Data de Nascimento: ${birthDate.toLocaleDateString('pt-BR')}`;
            } else {
                patientPhoto.src = defaultUserIcon;
                patientNameElement.textContent = 'Nome: Paciente não encontrado';
                patientAgeElement.textContent = 'Idade: -';
                patientDOBElement.textContent = 'Data de Nascimento: -';
                localStorage.removeItem('selectedPatientId');
            }
        } catch (error) {
            console.error('Erro ao carregar os dados do paciente:', error);
            patientNameElement.textContent = 'Nome: Erro ao carregar paciente';
            patientAgeElement.textContent = 'Idade: -';
            patientDOBElement.textContent = 'Data de Nascimento: -';
        }
    }

    // Função para abrir e preencher o MODAL DE EDIÇÃO
    function openEditModal(patient) {
        if (!patient) {
            alert('Por favor, selecione um paciente na página de Pacientes primeiro.');
            return;
        }

        document.getElementById('edit-patient-id').value = patient.id;

        editProfileImage.src = patient.photo || defaultModalIcon; // Foto no modal

        // Preenche o formulário de edição
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

    // Listener para pré-visualizar a nova foto no modal de edição
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

    // EVENTOS DO MODAL DE EDIÇÃO
    if (contentLink) {
        contentLink.addEventListener('click', function(event) {
            event.preventDefault(); // Impede a navegação padrão do link
            openEditModal(selectedPatient); // Abre o modal de EDIÇÃO
        });
    }

    if (modalCloseButton) {
        modalCloseButton.addEventListener('click', function() {
            editModal.style.display = "none";
        });
    }

    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', function() {
            editModal.style.display = "none";
        });
    }

    window.onclick = function(event) {
        if (event.target === editModal) {
            editModal.style.display = "none";
        }
    };

    // Lógica para salvar as alterações do formulário de edição
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
                loadSelectedPatient(); // Recarrega a exibição na página principal
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

    loadSelectedPatient(); // Carrega o paciente selecionado ao iniciar a página
});