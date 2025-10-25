document.addEventListener('DOMContentLoaded', function() {
    // Referências DOM
    const fieldsListContainer = document.getElementById('current-fields-list');
    const openModalButton = document.getElementById('openAddFieldModalButton');
    const addFieldModal = document.getElementById('add-field-modal');
    const closeModalButton = document.querySelector('.close-modal-button');
    const fieldForm = document.getElementById('fieldForm');
    const fieldNameInput = document.getElementById('fieldName');
    const fieldTypeSelect = document.getElementById('fieldType');
    const fieldOptionsContainer = document.getElementById('fieldOptionsContainer');
    const fieldOptionsInput = document.getElementById('fieldOptions');
    const editingFieldIdInput = document.getElementById('editingFieldId');
    const modalTitle = document.getElementById('modalTitle');

    // Chave GLOBAL para salvar a configuração de campos no localStorage
    const GLOBAL_CONFIG_KEY = 'globalFieldsConfig';

    // Carrega a configuração de campos (ou array vazio se não existir)
    function loadFieldsConfig() {
        return JSON.parse(localStorage.getItem(GLOBAL_CONFIG_KEY)) || [];
    }

    // Salva a configuração de campos
    function saveFieldsConfig(config) {
        localStorage.setItem(GLOBAL_CONFIG_KEY, JSON.stringify(config));
    }

    // Renderiza a lista de campos na tela
    function renderFieldsList() {
        const config = loadFieldsConfig();
        fieldsListContainer.innerHTML = ''; // Limpa a lista atual

        if (config.length === 0) {
            fieldsListContainer.innerHTML = '<p>Nenhum campo configurado ainda.</p>';
            return;
        }

        config.forEach((field, index) => {
            const fieldItem = document.createElement('div');
            fieldItem.className = 'field-item';
            fieldItem.innerHTML = `
                <span>${field.name} <span class="field-type">(${field.type})</span></span>
                <div class="field-actions">
                    <button class="delete-button" data-index="${index}" title="Remover Campo">&times;</button>
                </div>
            `;
            fieldsListContainer.appendChild(fieldItem);
        });

        // Adiciona listeners aos botões de deletar
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', handleDeleteField);
        });
    }

    // Manipulador para deletar um campo
    function handleDeleteField(event) {
        const indexToDelete = parseInt(event.target.getAttribute('data-index'));
        if (isNaN(indexToDelete)) return;

        if (confirm('Tem certeza que deseja remover este campo da configuração padrão?')) {
            let config = loadFieldsConfig();
            config.splice(indexToDelete, 1); // Remove o campo pelo índice
            saveFieldsConfig(config);
            renderFieldsList(); // Atualiza a lista na tela
        }
    }

    // Abre o modal (para adicionar ou editar)
    function openModal() {
        fieldForm.reset(); // Limpa o formulário
        editingFieldIdInput.value = ''; // Garante que não está em modo edição
        modalTitle.textContent = 'Adicionar Novo Campo';
        fieldOptionsContainer.style.display = 'none';
        addFieldModal.style.display = 'block';
    }

    // Fecha o modal
    function closeModal() {
        addFieldModal.style.display = 'none';
    }

    // Mostra/Esconde o campo de opções baseado no tipo selecionado
    fieldTypeSelect.addEventListener('change', function() {
        const showOptions = this.value === 'radio' || this.value === 'checkbox';
        fieldOptionsContainer.style.display = showOptions ? 'block' : 'none';
        fieldOptionsInput.required = showOptions;
    });

    // Manipulador para salvar um campo novo ou editado
    fieldForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const fieldName = fieldNameInput.value.trim();
        const fieldType = fieldTypeSelect.value;
        const optionsString = fieldOptionsInput.value.trim();
        let options = [];

        if (!fieldName) { alert('Nome do campo é obrigatório.'); return; }

        if ((fieldType === 'radio' || fieldType === 'checkbox')) {
            if (!optionsString) { alert('Opções são obrigatórias para radio/checkbox.'); return; }
            options = optionsString.split(',').map(opt => opt.trim()).filter(opt => opt);
            if (options.length < 1) { alert('Informe pelo menos uma opção válida.'); return; }
        }

        const newField = {
            id: `field_${Date.now()}`, // ID único baseado no tempo
            name: fieldName,
            type: fieldType,
            options: options
        };

        let config = loadFieldsConfig();
        config.push(newField); // Adiciona o novo campo
        saveFieldsConfig(config); // Salva a configuração atualizada
        renderFieldsList(); // Atualiza a lista na tela
        closeModal(); // Fecha o modal
    });

    // --- Event Listeners ---
    openModalButton.addEventListener('click', openModal);
    closeModalButton.addEventListener('click', closeModal);
    window.onclick = (event) => { if (event.target === addFieldModal) closeModal(); };

    // --- Inicialização ---
    renderFieldsList(); // Carrega e exibe os campos ao iniciar a página
});