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
            photoText.innerHTML = 'Alterar <br> Foto';
        }
    });

    // Lógica para salvar os dados do paciente ao submeter o formulário
    patientForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('patientName').value;
        const dob = document.getElementById('patientDOB').value;
        const cpf = document.getElementById('patientCPF').value;
        const rg = document.getElementById('patientRG').value;
        const responsible = document.getElementById('patientResponsible').value;

        function savePatient(photo) {
            const patient = {
                id: Date.now().toString(),
                name: name,
                dob: dob,
                cpf: cpf,
                rg: rg,
                responsible: responsible,
                photo: photo
            };

            let patients = JSON.parse(localStorage.getItem('patients')) || [];
            patients.push(patient);
            localStorage.setItem('patients', JSON.stringify(patients));
            window.location.href = 'patient.html';
        }

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