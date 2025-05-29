/**
 * Sistema de Gerenciamento de Professores
 * Este arquivo contém todas as funcionalidades relacionadas ao gerenciamento de professores
 * incluindo cadastro, listagem, edição e exclusão.
 */

// URL base da API para operações com professores
const API_URL_PROFESSORES = "https://school-system-spi.onrender.com/api/professores";

/**
 * Valida os dados do professor antes de enviar para a API
 * @param {Object} data - Dados do professor a serem validados
 * @returns {Object} Dados validados e formatados
 * @throws {Error} Se os dados forem inválidos
 */
function validarDadosProfessor(data) {
    // Verifica campos obrigatórios
    if (!data.nome || !data.idade || !data.materia) {
        throw new Error('Por favor, preencha todos os campos obrigatórios.');
    }

    // Valida a idade do professor
    if (data.idade < 18 || data.idade > 100) {
        throw new Error('A idade deve estar entre 18 e 100 anos.');
    }

    // Retorna os dados formatados
    return {
        ...data,
        nome: data.nome.trim(),
        materia: data.materia.trim(),
        observacoes: data.observacoes ? data.observacoes.trim() : ''
    };
}

/**
 * Exibe uma mensagem de erro temporária na interface
 * @param {string} mensagem - Mensagem de erro a ser exibida
 */
function mostrarErro(mensagem) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = mensagem;
    document.querySelector('.form-container').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

/**
 * Exibe uma mensagem de sucesso temporária na interface
 * @param {string} mensagem - Mensagem de sucesso a ser exibida
 */
function mostrarSucesso(mensagem) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = mensagem;
    document.querySelector('.form-container').prepend(successDiv);
    setTimeout(() => successDiv.remove(), 5000);
}

/**
 * Abre o popup de edição de professor
 */
function abrirPopup() {
    document.getElementById('edit-popup').style.display = 'block';
}

/**
 * Fecha o popup de edição de professor
 */
function fecharPopup() {
    document.getElementById('edit-popup').style.display = 'none';
}

/**
 * Carrega os dados de um professor para edição
 * @param {number} id - ID do professor a ser editado
 */
async function editarProfessor(id) {
    try {
        // Busca os dados do professor na API
        const response = await fetch(`${API_URL_PROFESSORES}/${id}`);
        if (!response.ok) throw new Error('Erro ao buscar dados do professor');
        
        const professor = await response.json();
        
        // Preenche o formulário com os dados do professor
        document.getElementById('professor-id').value = professor.id;
        document.getElementById('update-nome').value = professor.nome;
        document.getElementById('update-idade').value = professor.idade;
        document.getElementById('update-materia').value = professor.materia;
        document.getElementById('update-observacoes').value = professor.observacoes || '';
        
        abrirPopup();
    } catch (error) {
        mostrarErro(error.message);
    }
}

/**
 * Exclui um professor do sistema
 * @param {number} id - ID do professor a ser excluído
 */
async function excluirProfessor(id) {
    if (!confirm('Tem certeza que deseja excluir este professor?')) return;
    
    try {
        const response = await fetch(`${API_URL_PROFESSORES}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erro ao excluir professor');
        
        mostrarSucesso('Professor excluído com sucesso!');
        listarProfessores();
    } catch (error) {
        mostrarErro(error.message);
    }
}

/**
 * Lista todos os professores cadastrados
 */
async function listarProfessores() {
    try {
        const container = document.getElementById('professores-lista');
        container.innerHTML = '<p>Carregando professores...</p>';

        // Busca a lista de professores na API
        const response = await fetch(API_URL_PROFESSORES);
        if (!response.ok) throw new Error('Erro ao buscar professores');
        
        const professores = await response.json();
        
        // Verifica se existem professores cadastrados
        if (!professores || professores.length === 0) {
            container.innerHTML = '<p>Nenhum professor cadastrado.</p>';
            return;
        }

        // Gera o HTML com a lista de professores
        container.innerHTML = `
            <h2>Lista de Professores</h2>
            <div class="professores-grid">
                ${professores.map(professor => `
                    <div class="professor-card">
                        <h3>${professor.nome}</h3>
                        <p><strong>ID:</strong> ${professor.id}</p>
                        <p><strong>Idade:</strong> ${professor.idade} anos</p>
                        <p><strong>Matéria:</strong> ${professor.materia}</p>
                        ${professor.observacoes ? `<p><strong>Observações:</strong> ${professor.observacoes}</p>` : ''}
                        <div class="professor-actions">
                            <button onclick="editarProfessor(${professor.id})" class="btn btn-primary">Editar</button>
                            <button onclick="excluirProfessor(${professor.id})" class="btn btn-secondary">Excluir</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        mostrarErro(error.message);
    }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Event listener para o formulário de cadastro
    const formCadastro = document.getElementById('professor-form');
    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Coleta os dados do formulário
                const formData = new FormData(e.target);
                const data = {
                    nome: formData.get('nome'),
                    idade: parseInt(formData.get('idade')),
                    materia: formData.get('materia'),
                    observacoes: formData.get('observacoes')
                };
                
                // Valida e envia os dados
                const dadosValidados = validarDadosProfessor(data);
                
                const response = await fetch(API_URL_PROFESSORES, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dadosValidados)
                });
                
                if (!response.ok) throw new Error('Erro ao cadastrar professor');
                
                mostrarSucesso('Professor cadastrado com sucesso!');
                e.target.reset();
                listarProfessores();
            } catch (error) {
                mostrarErro(error.message);
            }
        });
    }

    // Event listener para o formulário de edição
    const formEdicao = document.getElementById('update-form');
    if (formEdicao) {
        formEdicao.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Coleta os dados do formulário de edição
                const id = document.getElementById('professor-id').value;
                const formData = new FormData(e.target);
                const data = {
                    nome: formData.get('nome'),
                    idade: parseInt(formData.get('idade')),
                    materia: formData.get('materia'),
                    observacoes: formData.get('observacoes')
                };
                
                // Valida e envia os dados
                const dadosValidados = validarDadosProfessor(data);
                
                const response = await fetch(`${API_URL_PROFESSORES}/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dadosValidados)
                });
                
                if (!response.ok) throw new Error('Erro ao atualizar professor');
                
                mostrarSucesso('Professor atualizado com sucesso!');
                fecharPopup();
                listarProfessores();
            } catch (error) {
                mostrarErro(error.message);
            }
        });
    }

    // Event listener para o botão de listar professores
    const btnListar = document.getElementById('listar-professores');
    if (btnListar) {
        btnListar.addEventListener('click', listarProfessores);
    }

    // Event listener para fechar o popup
    const btnFechar = document.getElementById('close-popup');
    if (btnFechar) {
        btnFechar.addEventListener('click', fecharPopup);
    }
});