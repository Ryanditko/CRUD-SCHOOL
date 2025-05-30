/**
 * Sistema de Gerenciamento de Turmas
 * Este arquivo contém todas as funcionalidades relacionadas ao gerenciamento de turmas
 * incluindo cadastro, listagem, edição e exclusão.
 * 
 * Funcionalidades principais:
 * - Cadastro de novas turmas
 * - Listagem de turmas cadastradas
 * - Edição de dados de turmas
 * - Exclusão de turmas
 * - Gerenciamento de status (ativo/inativo)
 * - Associação com professores
 */

// URL base da API para operações com turmas
const API_URL_TURMAS = "https://school-system-spi.onrender.com/api/turmas";

/**
 * Event listener para o formulário de cadastro de turmas
 * @description Coleta os dados do formulário e envia para a API
 */
document.getElementById("turma-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    // Coleta e formata os dados do formulário
    const data = {
        nome: form.nome.value,
        materia: form.materia.value,
        descricao: form.descricao.value,
        ativo: parseInt(form.ativo.value),
        professor_id: parseInt(form.professor_id.value)
    };

    try {
        // Envia os dados para a API
        const response = await fetch(API_URL_TURMAS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Erro ao cadastrar turma: ${response.status}`);
        }

        const result = await response.json();
        alert("Turma cadastrada com sucesso!");
        console.log(result);
        form.reset();
    } catch (error) {
        console.error("Erro ao cadastrar turma:", error);
        alert("Erro ao cadastrar turma. Por favor, tente novamente.");
    }
});

/**
 * Event listener para o botão de listar turmas
 * @description Busca todas as turmas cadastradas e exibe em cards na interface
 */
document.getElementById("listar-turmas").addEventListener("click", async () => {
    try {
        const container = document.getElementById("turmas-lista");
        container.innerHTML = "<p>Carregando turmas...</p>";

        // Busca a lista de turmas na API
        const response = await fetch(API_URL_TURMAS);
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar turmas: ${response.status}`);
        }

        const turmas = await response.json();

        // Verifica se existem turmas cadastradas
        if (!turmas || turmas.length === 0) {
            container.innerHTML = "<p>Nenhuma turma cadastrada.</p>";
            return;
        }

        // Gera o HTML com a lista de turmas em cards
        container.innerHTML = `
            <h2>Lista de Turmas</h2>
            <div class="turmas-grid">
                ${turmas.map(turma => `
                    <div class="turma-card">
                        <h3>${turma.nome}</h3>
                        <p><strong>ID:</strong> ${turma.id}</p>
                        <p><strong>Matéria:</strong> ${turma.materia}</p>
                        <p><strong>Descrição:</strong> ${turma.descricao || 'Não informada'}</p>
                        <p><strong>Status:</strong> ${turma.ativo ? 'Ativa' : 'Inativa'}</p>
                        <p><strong>Professor ID:</strong> ${turma.professor_id}</p>
                        <div class="turma-actions">
                            <button onclick="editarTurma(${turma.id})" class="btn btn-primary">Editar</button>
                            <button onclick="excluirTurma(${turma.id})" class="btn btn-secondary">Excluir</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error("Erro ao listar turmas:", error);
        document.getElementById("turmas-lista").innerHTML = `
            <p class="error-message">Erro ao carregar a lista de turmas. Por favor, tente novamente.</p>
        `;
    }
});

/**
 * Carrega os dados de uma turma para edição
 * @param {number} id - ID da turma a ser editada
 * @description Busca os dados da turma na API e preenche o formulário de edição
 */
async function editarTurma(id) {
    try {
        // Busca os dados da turma na API
        const response = await fetch(`${API_URL_TURMAS}/${id}`);
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar turma: ${response.status}`);
        }

        const turma = await response.json();

        if (!turma || !turma.turma) {
            throw new Error("Dados da turma não encontrados");
        }

        // Preenche o formulário com os dados da turma
        document.getElementById("turma-id").value = turma.turma.id;
        document.getElementById("update-nome").value = turma.turma.nome;
        document.getElementById("update-materia").value = turma.turma.materia;
        document.getElementById("update-descricao").value = turma.turma.descricao || '';
        document.getElementById("update-ativo").value = turma.turma.ativo;
        document.getElementById("update-professor_id").value = turma.turma.professor_id;

        // Exibe o popup de edição
        document.getElementById("edit-popup").style.display = "block";
    } catch (error) {
        console.error("Erro ao editar turma:", error);
        alert("Erro ao carregar dados da turma. Por favor, tente novamente.");
    }
}

/**
 * Event listener para o formulário de atualização de turma
 * @description Coleta os dados atualizados e envia para a API
 */
document.getElementById("update-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const form = e.target;
        const turmaId = document.getElementById("turma-id").value;
        // Coleta e formata os dados do formulário
        const data = {
            nome: form["update-nome"].value,
            materia: form["update-materia"].value,
            descricao: form["update-descricao"].value,
            ativo: parseInt(form["update-ativo"].value),
            professor_id: parseInt(form["update-professor_id"].value)
        };

        // Envia os dados atualizados para a API
        const response = await fetch(`${API_URL_TURMAS}/${turmaId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Erro ao atualizar turma: ${response.status}`);
        }

        const result = await response.json();
        alert("Turma atualizada com sucesso!");
        console.log(result);
        form.reset();

        // Fecha o popup e atualiza a lista
        document.getElementById("edit-popup").style.display = "none";
        document.getElementById("listar-turmas").click();
    } catch (error) {
        console.error("Erro ao atualizar turma:", error);
        alert("Erro ao atualizar turma. Por favor, tente novamente.");
    }
});

/**
 * Exclui uma turma do sistema
 * @param {number} id - ID da turma a ser excluída
 * @description Solicita confirmação antes de excluir e atualiza a lista após a exclusão
 */
async function excluirTurma(id) {
    if (!confirm("Tem certeza que deseja excluir esta turma?")) {
        return;
    }

    try {
        // Envia a requisição de exclusão para a API
        const response = await fetch(`${API_URL_TURMAS}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`Erro ao excluir turma: ${response.status}`);
        }

        const result = await response.json();
        alert("Turma excluída com sucesso!");
        console.log(result);

        // Atualiza a lista de turmas
        document.getElementById("listar-turmas").click();
    } catch (error) {
        console.error("Erro ao excluir turma:", error);
        alert("Erro ao excluir turma. Por favor, tente novamente.");
    }
}

/**
 * Event listener para fechar o popup de edição
 * @description Oculta o popup quando o botão de fechar é clicado
 */
document.getElementById("close-popup").addEventListener("click", () => {
    document.getElementById("edit-popup").style.display = "none";
});