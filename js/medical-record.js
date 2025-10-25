document.addEventListener('DOMContentLoaded', function() {
    // Referências DOM
    const patientPhotoElement = document.getElementById('patientPhoto');
    const patientNameElement = document.getElementById('patientName');
    const dateInputElement = document.getElementById('recordDate');
    const shiftRadioButtons = document.querySelectorAll('input[name="shift"]');
    const diurnoFieldsContainer = document.getElementById('diurno-fields-container');
    const noturnoFieldsContainer = document.getElementById('noturno-fields-container');
    const diurnoFormDiv = document.getElementById('diurno-form');
    const noturnoFormDiv = document.getElementById('noturno-form');
    const medicalRecordForm = document.getElementById('medicalRecordForm');
    const saveButton = document.getElementById('saveRecordButton');
    const exportPdfButton = document.getElementById('exportPdfButton');
    const addFieldButton = document.getElementById('addFieldButton');
    const selectPatientIconButton = document.getElementById('selectPatientIcon');

    // Modal de Seleção
    const patientSelectionModal = document.getElementById('patientSelectionModal');
    const modalPatientList = document.getElementById('modal-patient-list');
    const closePatientSelectionModalButton = document.querySelector('.close-patient-selection-modal');

    // Modal de Adicionar Campo
    const addFieldModal = document.getElementById('add-field-modal');
    // ... (refs do modal add field)

    const GLOBAL_CONFIG_KEY = 'globalFieldsConfig';
    let currentPatientId = null;
    let currentPatientData = null;
    let globalFieldsConfig = [];

    // --- Lógica Principal ---

    // Função central para CARREGAR DADOS DO PACIENTE E RENDERIZAR
    function loadAndDisplayPatient(patientId) {
        if (!patientId) {
            patientNameElement.textContent = 'Nenhum paciente selecionado';
            patientPhotoElement.src = 'img/user_icon2.png';
            medicalRecordForm.classList.add('hidden'); // Esconde form se não há paciente
            addFieldButton.classList.add('hidden');
            currentPatientId = null;
            currentPatientData = null;
            return false;
        }

        currentPatientId = patientId;
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        currentPatientData = patients.find(p => p.id === currentPatientId);

        if (currentPatientData) {
            patientPhotoElement.src = currentPatientData.photo || 'img/user_icon2.png';
            patientNameElement.textContent = currentPatientData.name;
            patientNameElement.style.color = '#333';

            medicalRecordForm.classList.remove('hidden'); // MOSTRA o formulário
            addFieldButton.classList.remove('hidden');

            loadGlobalFieldsConfig(); // Carrega config de campos
            if (!dateInputElement.value) { dateInputElement.valueAsDate = new Date(); } // Define data se vazia
            renderFields(); // Renderiza os campos
            switchShiftView(true); // Garante que o turno correto esteja visível
            return true;
        } else {
            patientNameElement.textContent = 'Paciente não encontrado';
            patientPhotoElement.src = 'img/user_icon2.png';
            medicalRecordForm.classList.add('hidden');
            addFieldButton.classList.add('hidden');
            currentPatientId = null;
            currentPatientData = null;
            localStorage.removeItem('selectedPatientId'); // Limpa seleção inválida
            return false;
        }
    }

    // --- Lógica do Modal de Seleção de Paciente ---

    function openPatientSelectionModal() {
        populatePatientSelectionModal();
        patientSelectionModal.style.display = 'block';
    }

    function closePatientSelectionModal() {
        patientSelectionModal.style.display = 'none';
    }

    function populatePatientSelectionModal() {
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        modalPatientList.innerHTML = '';

        if (patients.length === 0) {
            modalPatientList.innerHTML = '<p>Nenhum paciente cadastrado.</p>';
            return;
        }

        patients.forEach(patient => {
            const item = document.createElement('div');
            item.className = 'modal-patient-item';
            item.dataset.patientId = patient.id;
            item.innerHTML = `
                <img src="${patient.photo || 'img/user_icon2.png'}" alt="${patient.name}">
                <span>${patient.name}</span>
            `;
            item.addEventListener('click', () => {
                // ATUALIZA A SELEÇÃO GLOBAL e recarrega a página
                localStorage.setItem('selectedPatientId', patient.id);
                loadAndDisplayPatient(patient.id); // Carrega dados do novo paciente
                closePatientSelectionModal();
            });
            modalPatientList.appendChild(item);
        });
    }

    // --- Funções de Gerenciamento de Dados e Campos (sem alterações significativas) ---
    // (loadGlobalFieldsConfig, renderFields, createFieldElement, saveRecordData,
    // switchShiftView, generatePDF, getSelectedShift, getStorageKey)
    // Cole estas funções EXATAMENTE como na resposta anterior AQUI.
    // ...

    function loadGlobalFieldsConfig() {
        try {
            const configString = localStorage.getItem(GLOBAL_CONFIG_KEY);
            globalFieldsConfig = configString ? JSON.parse(configString) : [];
        } catch (error) { console.error("Erro config:", error); globalFieldsConfig = []; }
    }

    function renderFields() {
        if (!currentPatientId) return;
        const shift = getSelectedShift();
        const container = shift === 'diurno' ? diurnoFieldsContainer : noturnoFieldsContainer;
        container.innerHTML = '';

        if (globalFieldsConfig.length === 0) {
            container.innerHTML = '<p>Nenhum campo configurado. Vá para a página de Configuração.</p>';
            return;
        }
        const date = dateInputElement.value;
        const storageKey = getStorageKey(date, shift);
        const savedValues = JSON.parse(localStorage.getItem(storageKey)) || {};

        globalFieldsConfig.forEach(field => {
            const fieldElement = createFieldElement(field, shift, savedValues[field.id]);
            if (fieldElement) container.appendChild(fieldElement);
        });
    }

    function createFieldElement(field, shift, savedValue) {
        const fieldWrapper = document.createElement('fieldset');
        fieldWrapper.className = 'dynamic-field';
        fieldWrapper.dataset.fieldId = field.id;

        const legend = document.createElement('legend');
        legend.textContent = field.name;
        fieldWrapper.appendChild(legend);

        const inputName = `${field.id}_${shift}`;

        switch (field.type) {
            case 'text':
                const input = document.createElement('input');
                input.type = 'text';
                input.name = inputName;
                input.value = savedValue || '';
                fieldWrapper.appendChild(input);
                break;
            case 'textarea':
                const textarea = document.createElement('textarea');
                textarea.name = inputName;
                textarea.rows = 4;
                textarea.value = savedValue || '';
                fieldWrapper.appendChild(textarea);
                break;
            case 'radio':
                field.options.forEach((option, index) => {
                    const radioId = `${inputName}_${index}`;
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = inputName;
                    radio.value = option;
                    radio.id = radioId;
                    radio.checked = (savedValue === option);

                    const label = document.createElement('label');
                    label.textContent = option;
                    label.htmlFor = radioId;

                    fieldWrapper.appendChild(radio);
                    fieldWrapper.appendChild(label);
                });
                break;
            case 'checkbox':
                const checkboxValues = savedValue || {};
                field.options.forEach((option, index) => {
                    const checkId = `${inputName}_${index}`;
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.name = `${inputName}_${option.replace(/\s+/g, '')}`;
                    checkbox.value = option;
                    checkbox.id = checkId;
                    checkbox.checked = checkboxValues[checkbox.name] || false;

                    const label = document.createElement('label');
                    label.textContent = option;
                    label.htmlFor = checkId;

                    fieldWrapper.appendChild(checkbox);
                    fieldWrapper.appendChild(label);
                });
                break;
        }
        return fieldWrapper;
    }

    function saveRecordData() {
        if (!currentPatientId || !dateInputElement.value) return;
        const date = dateInputElement.value;
        const shift = getSelectedShift();
        const storageKey = getStorageKey(date, shift);
        const dataToSave = {};
        const container = shift === 'diurno' ? diurnoFieldsContainer : noturnoFieldsContainer;

        globalFieldsConfig.forEach(field => {
            const inputName = `${field.id}_${shift}`;
            let value;
            switch (field.type) {
                case 'text':
                case 'textarea': value = container.querySelector(`[name="${inputName}"]`)?.value || ''; break;
                case 'radio': value = container.querySelector(`input[name="${inputName}"]:checked`)?.value || ''; break;
                case 'checkbox':
                    value = {};
                    field.options.forEach(option => {
                        const checkName = `${inputName}_${option.replace(/\s+/g, '')}`;
                        const checkbox = container.querySelector(`input[name="${checkName}"]`);
                        if (checkbox) value[checkName] = checkbox.checked;
                    });
                    break;
                default: value = '';
            }
            dataToSave[field.id] = value;
        });
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }

    function switchShiftView(initialLoad = false) {
        if (!currentPatientId) return; // Não faz nada se não houver paciente
        if (!initialLoad) saveRecordData();
        const shiftToShow = getSelectedShift();
        diurnoFormDiv.classList.toggle('hidden', shiftToShow !== 'diurno');
        noturnoFormDiv.classList.toggle('hidden', shiftToShow !== 'noturno');
        renderFields();
    }

    function generatePDF() {
        if (!currentPatientData || !dateInputElement.value) { alert('Selecione um paciente e uma data.'); return; }
        const date = dateInputElement.value;
        const shift = getSelectedShift();
        const storageKey = getStorageKey(date, shift);
        const savedValues = JSON.parse(localStorage.getItem(storageKey)) || {};

        if (globalFieldsConfig.length === 0) {
            alert('Nenhum campo configurado para gerar o PDF.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`Prontuário - ${currentPatientData.name}`, 105, 15, null, null, 'center');
        doc.setFontSize(12);
        doc.text(`Data: ${new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')}   Turno: ${shift === 'diurno' ? 'Diurno' : 'Noturno'}`, 10, 25);

        let yPos = 40;
        const addText = (text) => {
            const lines = doc.splitTextToSize(text, 180);
            lines.forEach(line => {
                if (yPos > 280) { doc.addPage(); yPos = 15; }
                doc.text(line, 10, yPos);
                yPos += 7;
            });
        };

        doc.setFontSize(14);
        addText('Dados Registrados:');
        yPos += 3;
        doc.setFontSize(10);

        globalFieldsConfig.forEach(field => {
            const value = savedValues[field.id];
            let displayValue = '';
            if (value !== undefined && value !== null) {
                if (field.type === 'checkbox') {
                    displayValue = Object.keys(value)
                        .filter(key => value[key])
                        .map(key => key.split('_').pop())
                        .join(', ') || 'Nenhuma opção selecionada';
                } else if (typeof value === 'boolean') {
                    displayValue = value ? 'Sim' : 'Não';
                } else {
                    displayValue = value || 'Não preenchido';
                }
                addText(`${field.name}: ${displayValue}`);
            } else {
                addText(`${field.name}: Não preenchido`);
            }
            yPos += 2;
        });

        doc.save(`Prontuario_${currentPatientData.name.replace(' ', '_')}_${date}_${shift}.pdf`);
    }

    function getSelectedShift() {
        const checkedRadio = document.querySelector('input[name="shift"]:checked');
        return checkedRadio ? checkedRadio.value : 'diurno';
    }

    function getStorageKey(date, shift) {
        // Retorna null se não houver ID para evitar chaves inválidas
        return currentPatientId ? `record_${currentPatientId}_${date}_${shift}` : null;
    }

    // --- Event Listeners ---
    selectPatientIconButton.addEventListener('click', (event) => {
        event.preventDefault();
        openPatientSelectionModal();
    });
    closePatientSelectionModalButton.addEventListener('click', closePatientSelectionModal);
    window.addEventListener('click', (event) => {
        if (event.target === patientSelectionModal) closePatientSelectionModal();
        // Adicione o fechamento do modal de add field aqui também, se necessário
        // if (event.target === addFieldModal) closeAddFieldModal();
    });

    shiftRadioButtons.forEach(radio => radio.addEventListener('change', () => { if(currentPatientId) switchShiftView(); }));
    dateInputElement.addEventListener('change', () => { if(currentPatientId) { saveRecordData(); renderFields(); }});
    saveButton.addEventListener('click', () => { if(currentPatientId) { saveRecordData(); alert('Registro salvo!'); } else { alert('Selecione um paciente.'); }});
    exportPdfButton.addEventListener('click', () => { if(currentPatientId) generatePDF(); else { alert('Selecione um paciente.'); }});

    addFieldButton.addEventListener('click', () => {
        // Mantenha a lógica de abrir o modal #add-field-modal aqui ou mova para config.
        const addFieldModal = document.getElementById('add-field-modal'); // Certifique-se que a ref existe
        if (addFieldModal) addFieldModal.style.display = 'block';
        // Lembre-se de implementar a lógica de salvar o novo campo globalmente
        alert('Lembre-se: Novos campos adicionados aqui são para este paciente/turno/data. Use a página de Configuração para campos padrão.');
    });

    // --- Inicialização ---
    // Tenta carregar o último paciente selecionado do localStorage
    const lastSelectedId = localStorage.getItem('selectedPatientId');
    loadAndDisplayPatient(lastSelectedId);

});