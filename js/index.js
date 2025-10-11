document.addEventListener('DOMContentLoaded', function() {
    const patientPhoto = document.getElementById('patientPhoto');
    const patientName = document.getElementById('patientName');
    const patientAge = document.getElementById('patientAge');
    const patientDOB = document.getElementById('patientDOB');

    const selectedPatientId = localStorage.getItem('selectedPatientId');
    const defaultUserIcon = 'img/user_icon.png';

    function loadSelectedPatient() {
        if (!selectedPatientId) {
            patientPhoto.src = defaultUserIcon;
            patientName.textContent = 'Selecione um Paciente';
            patientAge.textContent = '';
            patientDOB.textContent = '';
            return;
        }

        try {
            const patients = JSON.parse(localStorage.getItem('patients')) || [];
            const patient = patients.find(p => String(p.id) === String(selectedPatientId));

            if (patient) {
                patientPhoto.src = patient.photo || defaultUserIcon;
                patientName.textContent = `Nome: ${patient.name}`;

                const birthDate = new Date(patient.dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                patientAge.textContent = `Idade: ${age} ano(s)`;
                patientDOB.textContent = `Data de Nascimento: ${birthDate.toLocaleDateString('pt-BR')}`;
            } else {
                patientPhoto.src = defaultUserIcon;
                patientName.textContent = 'Nome: Paciente não encontrado';
                patientAge.textContent = 'Idade: -';
                patientDOB.textContent = 'Data de Nascimento: -';
                localStorage.removeItem('selectedPatientId');
            }
        } catch (error) {
            console.error('Erro ao carregar os dados do paciente:', error);
            patientName.textContent = 'Nome: Erro ao carregar paciente';
            patientAge.textContent = 'Idade: -';
            patientDOB.textContent = 'Data de Nascimento: -';
        }
    }

    loadSelectedPatient();

});
