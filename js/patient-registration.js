document.addEventListener('DOMContentLoaded', function() {
    const patientForm = document.getElementById('patientForm');
    const patientPhotoInput = document.getElementById('patientPhoto');
    const profileImage = document.getElementById('profile-picture');
    const photoText = document.getElementById('photo-text');
    const clearButton = document.getElementById('clearButton');
    const defaultPhotoSrc = 'img/user_icon2.png';

    // Lógica para pré-visualizar a imagem e alterar o texto
    patientPhotoInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
            photoText.innerHTML = 'Alterar<br>Foto';
        }
    });

    // Função principal de salvamento de dados
    patientForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // 1. Coleta de Dados SIMPLES (Name, Sexo, DOB, CPF, RG, Responsável)
        const name = document.getElementById('patientName').value;
        const gender = document.getElementById('patientGender').value;
        const dob = document.getElementById('patientDOB').value;
        const cpf = document.getElementById('patientCPF').value;
        const rg = document.getElementById('patientRG').value;
        const responsible = document.getElementById('patientResponsible').value;
        const email = document.getElementById('patientEmail').value;

        // 2. Coleta de Dados Agrupados (Telefones)
        const phone1 = document.getElementById('patientPhone1').value;
        const phone2 = document.getElementById('patientPhone2').value;

        // 3. Coleta de Dados Complexos (Endereço)
        const patientAddress = {
            address: document.getElementById('patientAddress').value,
            number: document.getElementById('patientAddressNumber').value,
            neighborhood: document.getElementById('patientNeighborhood').value,
            city: document.getElementById('patientCity').value,
            state: document.getElementById('patientState').value,
            zipCode: document.getElementById('patientZipCode').value
        };

        // Função interna para montar e salvar o objeto do paciente
        function savePatient(photo) {
            const patient = {
                id: Date.now().toString(),

                // Dados Básicos e Pessoais
                name: name,
                gender: gender, // NOVO CAMPO
                dob: dob,
                cpf: cpf,
                rg: rg,
                responsible: responsible,

                // Contato
                email: email, // NOVO CAMPO
                phone1: phone1, // NOVO CAMPO
                phone2: phone2, // NOVO CAMPO

                // Endereço (Objeto)
                address: patientAddress, // NOVO CAMPO

                // Foto
                photo: photo
            };

            let patients = JSON.parse(localStorage.getItem('patients')) || [];
            patients.push(patient);
            localStorage.setItem('patients', JSON.stringify(patients));

            window.location.href = 'patient.html';
        }

        // Lógica para lidar com a foto (se selecionada ou padrão)
        if (patientPhotoInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const photo = e.target.result;
                savePatient(photo);
            };
            reader.readAsDataURL(patientPhotoInput.files[0]);
        } else {
            savePatient(defaultPhotoSrc);
        }
    });

    // Lógica para limpar os campos do formulário
    clearButton.addEventListener('click', function() {
        patientForm.reset();
        profileImage.src = defaultPhotoSrc;
        photoText.textContent = 'Adicionar Foto';
    });
});