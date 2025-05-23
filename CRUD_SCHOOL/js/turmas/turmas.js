const API_URL = "https://school-system-spi.onrender.com/api/turmas";

document.getElementById("turma-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
        nome: form.nome.value,
        materia: form.materia.value,
        descricao: form.descricao.value,
        ativo: parseInt(form.ativo.value),
        professor_id: parseInt(form.professor_id.value)
    };

    try {
        const response = await fetch(API_URL, {
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

// Função de Listar Turmas
document.getElementById("listar-turmas").addEventListener("click", async () => {
    try {
        const container = document.getElementById("turmas-lista");
        container.innerHTML = "<p>Carregando turmas...</p>";

        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar turmas: ${response.status}`);
        }

        const turmas = await response.json();

        if (!turmas || turmas.length === 0) {
            container.innerHTML = "<p>Nenhuma turma cadastrada.</p>";
            return;
        }

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

// Função de Editar Turma
async function editarTurma(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar turma: ${response.status}`);
        }

        const turma = await response.json();

        if (!turma || !turma.turma) {
            throw new Error("Dados da turma não encontrados");
        }

        // Preenchendo o formulário de edição
        document.getElementById("turma-id").value = turma.turma.id;
        document.getElementById("update-nome").value = turma.turma.nome;
        document.getElementById("update-materia").value = turma.turma.materia;
        document.getElementById("update-descricao").value = turma.turma.descricao || '';
        document.getElementById("update-ativo").value = turma.turma.ativo;
        document.getElementById("update-professor_id").value = turma.turma.professor_id;

        // Exibindo o pop-up para edição
        document.getElementById("edit-popup").style.display = "block";
    } catch (error) {
        console.error("Erro ao editar turma:", error);
        alert("Erro ao carregar dados da turma. Por favor, tente novamente.");
    }
}

// Função de Atualizar Turma
document.getElementById("update-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const form = e.target;
        const turmaId = document.getElementById("turma-id").value;
        const data = {
            nome: form["update-nome"].value,
            materia: form["update-materia"].value,
            descricao: form["update-descricao"].value,
            ativo: parseInt(form["update-ativo"].value),
            professor_id: parseInt(form["update-professor_id"].value)
        };

        const response = await fetch(`${API_URL}/${turmaId}`, {
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

        // Fechar o pop-up após a atualização
        document.getElementById("edit-popup").style.display = "none";
        
        // Atualizar a lista de turmas
        document.getElementById("listar-turmas").click();
    } catch (error) {
        console.error("Erro ao atualizar turma:", error);
        alert("Erro ao atualizar turma. Por favor, tente novamente.");
    }
});

// Função de Excluir Turma
async function excluirTurma(id) {
    if (!confirm("Tem certeza que deseja excluir esta turma?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`Erro ao excluir turma: ${response.status}`);
        }

        const result = await response.json();
        alert("Turma excluída com sucesso!");
        console.log(result);

        // Atualizar a lista de turmas
        document.getElementById("listar-turmas").click();
    } catch (error) {
        console.error("Erro ao excluir turma:", error);
        alert("Erro ao excluir turma. Por favor, tente novamente.");
    }
}

// Função para fechar o pop-up de edição
document.getElementById("close-popup").addEventListener("click", () => {
    document.getElementById("edit-popup").style.display = "none";
});