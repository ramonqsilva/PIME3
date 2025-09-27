document.addEventListener('DOMContentLoaded', function() {
    const patientPhoto = document.getElementById('patientPhoto');
    const patientName = document.getElementById('patientName');
    const patientAge = document.getElementById('patientAge');
    const patientDOB = document.getElementById('patientDOB');

    // Obtém o ID do paciente da URL ou do localStorage
    const urlParams = new URLSearchParams(window.location.search);
    let patientId = urlParams.get('id') || localStorage.getItem('selectedPatientId');

    if (!patientId) {
        // Não há paciente selecionado, limpa as informações
        patientPhoto.src = 'img/user_icon.png'
        patientName.textContent = 'Selecione um Paciente';
        patientAge.textContent = '';
        patientDOB.textContent = '';
    } else {
        try {
            const patients = JSON.parse(localStorage.getItem('patients')) || [];
            const patient = patients.find(p => String(p.id) === String(patientId));

            if (patient) {
                patientPhoto.src = patient.photo || 'img/user_icon.png';
                patientName.textContent = patient.name || 'Nome não disponível';

                const birthDate = new Date(patient.dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                // Ajusta a idade caso o aniversário ainda não tenha ocorrido este ano
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                patientAge.textContent = `${age} ano(s)`;
                patientDOB.textContent = `Nascimento: ${birthDate.toLocaleDateString('pt-BR')}`;

                // Armazena o ID do paciente no localStorage
                localStorage.setItem('selectedPatientId', patientId);
            } else {
                // Paciente não encontrado
                patientPhoto.src = 'img/user_icon.png';
                patientName.textContent = 'Paciente não encontrado';
                patientAge.textContent = '-';
                patientDOB.textContent = '-';
            }
        } catch (error) {
            console.error('Erro ao carregar os dados do paciente:', error);
            patientName.textContent = 'Erro ao carregar paciente';
            patientAge.textContent = '-';
            patientDOB.textContent = '-';
        }
    }

    // Evento de clique no ícone para redirecionar para dados.html
    const dataIcon = document.getElementById('data-icon');
    if (dataIcon) {
        dataIcon.addEventListener('click', function(event) {
            event.preventDefault();
            const selectedId = localStorage.getItem('selectedPatientId');
            if (selectedId) {
                window.location.href = `data.html?id=${selectedId}`;
            } else {
                alert('Selecione um paciente primeiro!');
            }
        });
    }
});
