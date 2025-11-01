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
    const closeAddFieldModalButton = document.querySelector('.close-add-field-modal');
    const addFieldForm = document.getElementById('addFieldForm');
    const fieldTypeSelect = document.getElementById('fieldType');
    const fieldOptionsContainer = document.getElementById('fieldOptionsContainer');
    const fieldOptionsInput = document.getElementById('fieldOptions');

    const GLOBAL_CONFIG_KEY = 'globalFieldsConfig';
    let PATIENT_CONFIG_KEY = '';

    let currentPatientId = null;
    let currentPatientData = null;
    let combinedFieldsConfig = [];
    let dateOnFocus = null;

    // --- Lógica Principal ---
    function loadAndDisplayPatient(patientId) {
        if (!patientId) {
            patientNameElement.textContent = 'Nenhum paciente selecionado';
            patientPhotoElement.src = 'img/user_icon2.png';
            medicalRecordForm.classList.add('hidden');
            addFieldButton.classList.add('hidden');
            currentPatientId = null;
            currentPatientData = null;
            return false;
        }

        currentPatientId = patientId;
        PATIENT_CONFIG_KEY = `patientFieldsConfig_${currentPatientId}`;
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        currentPatientData = patients.find(p => p.id === currentPatientId);

        if (currentPatientData) {
            patientPhotoElement.src = currentPatientData.photo || 'img/user_icon2.png';
            patientNameElement.textContent = currentPatientData.name;
            patientNameElement.style.color = '#333';
            medicalRecordForm.classList.remove('hidden');
            addFieldButton.classList.remove('hidden');

            getCombinedFieldsConfig();
            if (!dateInputElement.value) {
                dateInputElement.valueAsDate = new Date();
            }
            dateOnFocus = dateInputElement.value;

            renderFields();
            switchShiftView(true);
            return true;
        } else {
            patientNameElement.textContent = 'Paciente não encontrado';
            patientPhotoElement.src = 'img/user_icon2.png';
            medicalRecordForm.classList.add('hidden');
            addFieldButton.classList.add('hidden');
            currentPatientId = null;
            currentPatientData = null;
            localStorage.removeItem('selectedPatientId');
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
            modalPatientList.innerHTML = '<p>Nenhum paciente cadastrado.</p>'; return;
        }
        patients.forEach(patient => {
            const item = document.createElement('div');
            item.className = 'modal-patient-item';
            item.dataset.patientId = patient.id;
            item.innerHTML = `<img src="${patient.photo || 'img/user_icon2.png'}" alt="${patient.name}"><span>${patient.name}</span>`;
            item.addEventListener('click', () => {
                localStorage.setItem('selectedPatientId', patient.id);
                loadAndDisplayPatient(patient.id);
                closePatientSelectionModal();
            });
            modalPatientList.appendChild(item);
        });
    }

    // --- Funções de Gerenciamento de Campos e Dados ---
    function getCombinedFieldsConfig() {
        let globalConfig = [];
        let patientConfig = [];
        try { globalConfig = JSON.parse(localStorage.getItem(GLOBAL_CONFIG_KEY)) || []; }
        catch (e) { console.error("Erro config Global:", e); globalConfig = []; }
        try { patientConfig = JSON.parse(localStorage.getItem(PATIENT_CONFIG_KEY)) || []; }
        catch (e) { console.error("Erro config Paciente:", e); patientConfig = []; }
        combinedFieldsConfig = [...globalConfig, ...patientConfig];
    }

    function renderFields() {
        if (!currentPatientId || !dateInputElement.value) return;
        const shift = getSelectedShift();
        const container = shift === 'diurno' ? diurnoFieldsContainer : noturnoFieldsContainer;
        container.innerHTML = '';

        if (combinedFieldsConfig.length === 0) {
            container.innerHTML = '<p>Nenhum campo configurado. Vá para a página de Configuração ou adicione um campo especial.</p>';
            return;
        }
        const date = dateInputElement.value;
        const storageKey = getStorageKey(date, shift);
        const savedValues = JSON.parse(localStorage.getItem(storageKey)) || {};

        combinedFieldsConfig.forEach(field => {
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
                input.type = 'text'; input.name = inputName; input.value = savedValue || '';
                fieldWrapper.appendChild(input);
                break;
            case 'textarea':
                const textarea = document.createElement('textarea');
                textarea.name = inputName; textarea.rows = 4; textarea.value = savedValue || '';
                fieldWrapper.appendChild(textarea);
                break;
            case 'radio':
                field.options.forEach((option, index) => {
                    const radioId = `${inputName}_${index}`;
                    const radio = document.createElement('input');
                    radio.type = 'radio'; radio.name = inputName; radio.value = option; radio.id = radioId;
                    radio.checked = (savedValue === option);
                    const label = document.createElement('label');
                    label.textContent = option; label.htmlFor = radioId;
                    fieldWrapper.appendChild(radio); fieldWrapper.appendChild(label);
                });
                break;
            case 'checkbox':
                const checkboxValues = savedValue || {};
                field.options.forEach((option, index) => {
                    const checkId = `${inputName}_${index}`;
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox'; checkbox.name = `${inputName}_${option.replace(/\s+/g, '')}`;
                    checkbox.value = option; checkbox.id = checkId;
                    checkbox.checked = checkboxValues[checkbox.name] || false;
                    const label = document.createElement('label');
                    label.textContent = option; label.htmlFor = checkId;
                    fieldWrapper.appendChild(checkbox); fieldWrapper.appendChild(label);
                });
                break;
        }
        return fieldWrapper;
    }

    function saveShiftData(date, shift) {
        if (!currentPatientId || !date) return;
        const storageKey = getStorageKey(date, shift);
        const dataToSave = {};
        const container = shift === 'diurno' ? diurnoFieldsContainer : noturnoFieldsContainer;
        getCombinedFieldsConfig();
        combinedFieldsConfig.forEach(field => {
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

    function saveAllShiftsData() {
        if (!currentPatientId) { alert('Nenhum paciente selecionado.'); return; }
        const date = dateInputElement.value;
        if (!date) { alert('Por favor, selecione uma data.'); return; }
        saveShiftData(date, 'diurno');
        saveShiftData(date, 'noturno');
        alert('Registros Diurno e Noturno salvos com sucesso!');
    }

    function switchShiftView(initialLoad = false) {
        if (!currentPatientId) return;
        const previousShift = getSelectedShift() === 'diurno' ? 'noturno' : 'diurno';
        if (!initialLoad) {
            saveShiftData(dateInputElement.value, previousShift);
        }
        const shiftToShow = getSelectedShift();
        diurnoFormDiv.classList.toggle('hidden', shiftToShow !== 'diurno');
        noturnoFormDiv.classList.toggle('hidden', shiftToShow !== 'noturno');
        renderFields();
    }

    // --- GERAÇÃO DE PDF ATUALIZADA (Formato Word, Centralizado, Negrito e Assinatura) ---
    function generatePDF() {
        if (!currentPatientData || !dateInputElement.value) { alert('Selecione um paciente e uma data.'); return; }
        const date = dateInputElement.value;
        const shift = getSelectedShift();
        const storageKey = getStorageKey(date, shift);
        const savedValues = JSON.parse(localStorage.getItem(storageKey)) || {};

        getCombinedFieldsConfig();
        if (combinedFieldsConfig.length === 0) {
            alert('Nenhum campo configurado para gerar o PDF.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const center = 105; // Ponto central da página A4 (210mm)
        const leftMargin = 20;
        const docWidth = 190;
        let yPos = 15; // Posição Y inicial (MAIS PRÓXIMA DO TOPO)

        // --- 1. Cabeçalho ---
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(currentPatientData.name || 'Paciente', center, yPos, { align: 'center' });
        yPos += 10;

        doc.setFontSize(10);

        // --- DADOS DO PACIENTE (Centralizado com Negrito) ---
        // Prepara os segmentos
        const rgLabel = "RG: ";
        const rgVal = currentPatientData.rg || 'Não informado';
        const cpfLabel = " | CPF: ";
        const cpfVal = currentPatientData.cpf || 'Não informado';
        const dobLabel = " | Nascimento: ";
        const dobVal = currentPatientData.dob ? new Date(currentPatientData.dob + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informado';

        // Calcula a largura total da string
        doc.setFont(undefined, 'bold');
        const rgLabelWidth = doc.getStringUnitWidth(rgLabel) * 10 / doc.internal.scaleFactor;
        const cpfLabelWidth = doc.getStringUnitWidth(cpfLabel) * 10 / doc.internal.scaleFactor;
        const dobLabelWidth = doc.getStringUnitWidth(dobLabel) * 10 / doc.internal.scaleFactor;
        doc.setFont(undefined, 'normal');
        const rgValWidth = doc.getStringUnitWidth(rgVal) * 10 / doc.internal.scaleFactor;
        const cpfValWidth = doc.getStringUnitWidth(cpfVal) * 10 / doc.internal.scaleFactor;
        const dobValWidth = doc.getStringUnitWidth(dobVal) * 10 / doc.internal.scaleFactor;

        const totalWidth = rgLabelWidth + rgValWidth + cpfLabelWidth + cpfValWidth + dobLabelWidth + dobValWidth;

        // Ponto X inicial para centralizar o bloco
        let currentX = center - (totalWidth / 2);

        // Imprime os segmentos
        doc.setFont(undefined, 'bold');
        doc.text(rgLabel, currentX, yPos);
        currentX += rgLabelWidth;

        doc.setFont(undefined, 'normal');
        doc.text(rgVal, currentX, yPos);
        currentX += rgValWidth;

        doc.setFont(undefined, 'bold');
        doc.text(cpfLabel, currentX, yPos);
        currentX += cpfLabelWidth;

        doc.setFont(undefined, 'normal');
        doc.text(cpfVal, currentX, yPos);
        currentX += cpfValWidth;

        doc.setFont(undefined, 'bold');
        doc.text(dobLabel, currentX, yPos);
        currentX += dobLabelWidth;

        doc.setFont(undefined, 'normal');
        doc.text(dobVal, currentX, yPos);

        yPos += 5;

        // Dados do registro (Centralizado)
        const recordDateStr = `Data do Registro: ${new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')} | Turno: ${shift === 'diurno' ? 'Diurno' : 'Noturno'}`;
        doc.text(recordDateStr, center, yPos, { align: 'center' });
        yPos += 10;

        doc.setLineWidth(0.3);
        doc.line(leftMargin, yPos, docWidth, yPos); // Linha horizontal
        yPos += 10;

        // --- 2. Corpo (Prontuário - Alinhado à Esquerda) ---
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text("Prontuário", leftMargin, yPos, { align: 'left' });
        yPos += 10;

        // Helper para adicionar itens na lista
        const addListItem = (index, field, value) => {
            if (yPos > 275) { doc.addPage(); yPos = 20; }
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');

            let displayValue = '';
            if (value !== undefined && value !== null) {
                if (field.type === 'checkbox') {
                    displayValue = Object.keys(value).filter(key => value[key]).map(key => key.split('_').pop()).join(', ') || '(Nenhuma opção)';
                } else {
                    displayValue = value || '(Vazio)';
                }
            } else {
                displayValue = '(Não preenchido)';
            }

            const titleString = `${index + 1}. ${field.name}`;
            doc.text(titleString, leftMargin, yPos, { align: 'left' });
            yPos += 6;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');

            const valueLines = doc.splitTextToSize(displayValue, docWidth - leftMargin - 5);
            doc.text(valueLines, leftMargin + 5, yPos, { align: 'left' });
            yPos += (valueLines.length * 6);
            yPos += 4;
        };

        combinedFieldsConfig.forEach((field, index) => {
            const value = savedValues[field.id];
            addListItem(index, field, value);
        });

        // --- 3. Campo de Assinatura ---
        if (yPos > 250) { doc.addPage(); yPos = 30; }
        else { yPos = Math.max(yPos + 20, 260); } // Posição dinâmica ou fixa

        doc.setFontSize(10);
        doc.line(50, yPos, 160, yPos); // Linha (x1, y1, x2, y2)
        yPos += 5;
        doc.text("Assinatura do Responsável", center, yPos, { align: 'center' });

        doc.save(`Prontuario_${currentPatientData.name.replace(' ', '_')}_${date}_${shift}.pdf`);
    }

    function getSelectedShift() {
        const checkedRadio = document.querySelector('input[name="shift"]:checked');
        return checkedRadio ? checkedRadio.value : 'diurno';
    }

    function getStorageKey(date, shift) {
        return currentPatientId ? `record_${currentPatientId}_${date}_${shift}` : null;
    }

    // --- Event Listeners ---
    selectPatientIconButton.addEventListener('click', (event) => {
        event.preventDefault();
        openPatientSelectionModal();
    });
    closePatientSelectionModalButton.addEventListener('click', closePatientSelectionModal);

    shiftRadioButtons.forEach(radio => radio.addEventListener('change', () => { if(currentPatientId) switchShiftView(); }));

    // CORREÇÃO DO BUG DA DATA
    dateInputElement.addEventListener('focus', () => {
        dateOnFocus = dateInputElement.value;
    });
    dateInputElement.addEventListener('change', () => {
        if(currentPatientId) {
            if (dateOnFocus && dateOnFocus !== dateInputElement.value) {
                saveShiftData(dateOnFocus, getSelectedShift());
            }
            dateOnFocus = dateInputElement.value;
            renderFields();
        }
    });

    saveButton.addEventListener('click', () => { if(currentPatientId) saveAllShiftsData(); else alert('Selecione um paciente.'); });
    exportPdfButton.addEventListener('click', () => { if(currentPatientId) generatePDF(); else { alert('Selecione um paciente.'); }});
    window.onclick = (event) => {
        if (event.target === patientSelectionModal) closePatientSelectionModal();
        if (event.target === addFieldModal) addFieldModal.style.display = 'none';
    };

    // --- Lógica do Modal de Adicionar Campo (Específico do Paciente) ---
    addFieldButton.addEventListener('click', () => {
        addFieldForm.reset();
        fieldOptionsContainer.style.display = 'none';
        addFieldModal.style.display = 'block';
    });
    closeAddFieldModalButton.addEventListener('click', () => { addFieldModal.style.display = 'none'; });
    fieldTypeSelect.addEventListener('change', function() {
        const showOptions = this.value === 'radio' || this.value === 'checkbox';
        fieldOptionsContainer.style.display = showOptions ? 'block' : 'none';
        fieldOptionsInput.required = showOptions;
    });
    addFieldForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (!currentPatientId) { alert("Nenhum paciente selecionado."); return; }
        const fieldName = document.getElementById('fieldName').value.trim();
        const fieldType = fieldTypeSelect.value;
        const optionsString = fieldOptionsInput.value.trim();
        let options = [];
        if (!fieldName) { alert('Nome do campo é obrigatório.'); return; }
        if ((fieldType === 'radio' || fieldType === 'checkbox')) {
            if (!optionsString) { alert('Opções são obrigatórias.'); return; }
            options = optionsString.split(',').map(opt => opt.trim()).filter(opt => opt);
            if (options.length < 1) { alert('Informe pelo menos uma opção válida.'); return; }
        }
        const newField = { id: `patientField_${Date.now()}`, name: fieldName, type: fieldType, options: options };
        let patientConfig = JSON.parse(localStorage.getItem(PATIENT_CONFIG_KEY)) || [];
        patientConfig.push(newField);
        localStorage.setItem(PATIENT_CONFIG_KEY, JSON.stringify(patientConfig));
        addFieldModal.style.display = 'none';
        getCombinedFieldsConfig();
        renderFields();
        alert('Novo campo específico do paciente adicionado!');
    });

    // --- Inicialização ---
    const lastSelectedId = localStorage.getItem('selectedPatientId');
    loadAndDisplayPatient(lastSelectedId);

});