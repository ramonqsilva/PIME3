document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    let patientId = urlParams.get('id');
    const dataInput = document.getElementById('data');
    const turnoDiurno = document.getElementById('diurnoFields');
    const turnoNoturno = document.getElementById('noturnoFields');
    const saveButton = document.getElementById('saveButton');
    const pdfButton = document.createElement('img');
    pdfButton.src = 'img/pdf_icone.png'; // Botão de PDF (adicione o caminho da imagem do ícone de PDF)
    pdfButton.classList.add('action-button');
    pdfButton.style.cursor = 'pointer';
    saveButton.parentElement.appendChild(pdfButton);

    if (!patientId) {
        patientId = localStorage.getItem('selectedPatientId');
    }

    function loadTurnoData(patientId, date, turno) {
        const prontuario = JSON.parse(localStorage.getItem(`prontuario_${patientId}_${date}_${turno}`)) || {};
        document.getElementById(`troca_${turno}`).value = prontuario.troca || '';
        document.getElementById(`intercorrencias_${turno}`).value = prontuario.intercorrencias || '';
        document.getElementById(`responsavel_${turno}`).value = prontuario.responsavel || '';

        const alimentacao = prontuario.alimentacao || '';
        const eliminacoes = prontuario.eliminacoes || '';
        const banho = prontuario.banho || '';
        const medicacao = prontuario.medicacao || '';

        document.querySelectorAll(`input[name="alimentacao_${turno}"]`).forEach(radio => {
            radio.checked = radio.value === alimentacao;
        });
        document.querySelectorAll(`input[name="eliminacoes_${turno}"]`).forEach(radio => {
            radio.checked = radio.value === eliminacoes;
        });
        document.querySelectorAll(`input[name="banho_${turno}"]`).forEach(radio => {
            radio.checked = radio.value === banho;
        });
        document.querySelectorAll(`input[name="medicacao_${turno}"]`).forEach(radio => {
            radio.checked = radio.value === medicacao;
        });

        document.querySelectorAll(`input[type="checkbox"][name*="${turno}"]`).forEach(checkbox => {
            checkbox.checked = prontuario[checkbox.name] || false;
        });
    }

    function clearTurnoData(turno) {
        document.getElementById(`troca_${turno}`).value = '';
        document.getElementById(`intercorrencias_${turno}`).value = '';
        document.getElementById(`responsavel_${turno}`).value = '';

        document.querySelectorAll(`input[name="alimentacao_${turno}"]`).forEach(radio => {
            radio.checked = false;
        });
        document.querySelectorAll(`input[name="eliminacoes_${turno}"]`).forEach(radio => {
            radio.checked = false;
        });
        document.querySelectorAll(`input[name="banho_${turno}"]`).forEach(radio => {
            radio.checked = false;
        });
        document.querySelectorAll(`input[name="medicacao_${turno}"]`).forEach(radio => {
            radio.checked = false;
        });

        document.querySelectorAll(`input[type="checkbox"][name*="${turno}"]`).forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    function saveTurnoData(patientId, date, turno) {
        const prontuario = {
            alimentacao: document.querySelector(`input[name="alimentacao_${turno}"]:checked`) ? document.querySelector(`input[name="alimentacao_${turno}"]:checked`).value : '',
            eliminacoes: document.querySelector(`input[name="eliminacoes_${turno}"]:checked`) ? document.querySelector(`input[name="eliminacoes_${turno}"]:checked`).value : '',
            banho: document.querySelector(`input[name="banho_${turno}"]:checked`) ? document.querySelector(`input[name="banho_${turno}"]:checked`).value : '',
            medicacao: document.querySelector(`input[name="medicacao_${turno}"]:checked`) ? document.querySelector(`input[name="medicacao_${turno}"]:checked`).value : '',
            troca: document.getElementById(`troca_${turno}`).value,
            intercorrencias: document.getElementById(`intercorrencias_${turno}`).value,
            responsavel: document.getElementById(`responsavel_${turno}`).value
        };

        document.querySelectorAll(`input[type="checkbox"][name*="${turno}"]`).forEach(checkbox => {
            prontuario[checkbox.name] = checkbox.checked;
        });

        localStorage.setItem(`prontuario_${patientId}_${date}_${turno}`, JSON.stringify(prontuario));
    }

    function toggleTurno(turno) {
        const date = dataInput.value;
        if (date) {
            const currentTurno = turnoDiurno.style.display === 'none' ? 'noturno' : 'diurno';
            saveTurnoData(patientId, date, currentTurno);
            if (turno === 'diurno') {
                turnoDiurno.style.display = 'block';
                turnoNoturno.style.display = 'none';
            } else {
                turnoDiurno.style.display = 'none';
                turnoNoturno.style.display = 'block';
            }
            loadTurnoData(patientId, date, turno);
        }
    }

    document.querySelectorAll('input[name="turno"]').forEach(radio => {
        radio.addEventListener('change', function() {
            toggleTurno(this.value);
        });
    });

    if (patientId) {
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const patient = patients.find(p => p.id === patientId);

        if (patient) {
            document.getElementById('patientPhoto').src = patient.photo || 'img/usuario_padrao.png';
            document.getElementById('patientName').textContent = patient.name;

            dataInput.addEventListener('change', function() {
                const date = this.value;
                const turno = document.querySelector('input[name="turno"]:checked').value;
                if (date) {
                    clearTurnoData('diurno');
                    clearTurnoData('noturno');
                    loadTurnoData(patientId, date, turno);
                }
            });

            saveButton.addEventListener('click', function() {
                const date = dataInput.value;
                const turno = document.querySelector('input[name="turno"]:checked').value;
                if (date) {
                    saveTurnoData(patientId, date, turno);
                    alert('Prontuário salvo com sucesso!');
                } else {
                    alert('Por favor, selecione uma data.');
                }
            });

            pdfButton.addEventListener('click', function() {
                const date = dataInput.value;
                const turno = document.querySelector('input[name="turno"]:checked').value;
                if (date) {
                    const prontuario = JSON.parse(localStorage.getItem(`prontuario_${patientId}_${date}_${turno}`)) || {};
                    generatePDF(patient, prontuario, date, turno);
                } else {
                    alert('Por favor, selecione uma data.');
                }
            });

            const today = new Date().toISOString().split('T')[0];
            dataInput.value = today;

            loadTurnoData(patientId, today, 'diurno');
        }
    }

    function generatePDF(patient, prontuario, date, turno) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text(`Nome: ${patient.name}`, 10, 10);
        doc.text(`Data: ${date}`, 10, 20);
        doc.text(`Plantão: ${turno === 'diurno' ? 'Diurno' : 'Noturno'}`, 10, 30);

        doc.setFontSize(12);
        doc.text('Dados do Prontuário:', 10, 40);
        Object.keys(prontuario).forEach((key, index) => {
            if (key !== 'intercorrencias') {
                doc.text(`${key}: ${prontuario[key]}`, 10, 50 + (index * 10));
            }
        });

        doc.text('Intercorrências:', 10, 100);
        doc.text(prontuario.intercorrencias || '', 10, 110);

        // Adiciona marca d'água
        doc.setTextColor(150, 150, 150);
        doc.text('CARIMBO!', 50, 150, { angle: 45 });

        // Gera PDF
        doc.save(`${patient.name}_${date}_prontuario.pdf`);
    }
});
