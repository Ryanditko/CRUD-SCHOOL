const API_URL = "https://school-system-spi.onrender.com/api/alunos";

/**
 * Função para formatar a data corretamente, considerando o timezone
 * @param {string} dateString - Data no formato ISO
 * @returns {string} Data formatada no padrão brasileiro
 */
function formatarData(dateString) {
    // Ajusta a data para o timezone local
    const data = new Date(dateString);
    // Adiciona o offset do timezone para compensar a conversão UTC
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString('pt-BR');
}

document.getElementById("aluno-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    nome: form.nome.value,
    data_nascimento: form.data_nascimento.value,
    nota_primeiro_semestre: parseFloat(form.nota_primeiro_semestre.value),
    nota_segundo_semestre: parseFloat(form.nota_segundo_semestre.value),
    turma_id: parseInt(form.turma_id.value)
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Erro ao cadastrar aluno: ${response.status}`);
    }

    const result = await response.json();
    alert("Aluno cadastrado com sucesso!");
    console.log(result);
    form.reset();
  } catch (error) {
    console.error("Erro ao cadastrar aluno:", error);
    alert("Erro ao cadastrar aluno. Por favor, tente novamente.");
  }
});

// Função de Listar Alunos
document.getElementById("listar-alunos").addEventListener("click", async () => {
  try {
    const container = document.getElementById("alunos-lista");
    container.innerHTML = "<p>Carregando alunos...</p>";

    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar alunos: ${response.status}`);
    }

    const alunos = await response.json();

    if (!alunos || alunos.length === 0) {
      container.innerHTML = "<p>Nenhum aluno cadastrado.</p>";
      return;
    }

    container.innerHTML = `
      <h2>Lista de Alunos</h2>
      <div class="alunos-grid">
        ${alunos.map(aluno => {
          const media = (aluno.nota_primeiro_semestre + aluno.nota_segundo_semestre) / 2;
          return `
            <div class="aluno-card">
              <h3>${aluno.nome}</h3>
              <p><strong>ID:</strong> ${aluno.id}</p>
              <p><strong>Data de Nascimento:</strong> ${formatarData(aluno.data_nascimento)}</p>
              <p><strong>Notas:</strong></p>
              <ul>
                <li>1º Semestre: ${aluno.nota_primeiro_semestre}</li>
                <li>2º Semestre: ${aluno.nota_segundo_semestre}</li>
              </ul>
              <p><strong>Média Final:</strong> ${media.toFixed(2)}</p>
              <p><strong>Turma ID:</strong> ${aluno.turma_id}</p>
              <div class="aluno-actions">
                <button onclick="editarAluno(${aluno.id})" class="btn btn-primary">Editar</button>
                <button onclick="excluirAluno(${aluno.id})" class="btn btn-secondary">Excluir</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (error) {
    console.error("Erro ao listar alunos:", error);
    document.getElementById("alunos-lista").innerHTML = `
      <p class="error-message">Erro ao carregar a lista de alunos. Por favor, tente novamente.</p>
    `;
  }
});

// Função de Editar Aluno
async function editarAluno(id) {
  try {
    console.log('Iniciando edição do aluno ID:', id);
    const response = await fetch(`${API_URL}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar aluno: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Resposta completa da API:', responseData);

    // Verifica se a resposta tem a estrutura esperada
    const aluno = responseData.aluno || responseData;
    console.log('Dados do aluno extraídos:', aluno);

    if (!aluno) {
      throw new Error("Dados do aluno não encontrados");
    }

    // Verifica se todos os campos necessários existem
    if (!aluno.id || !aluno.nome || !aluno.data_nascimento || 
        aluno.nota_primeiro_semestre === undefined || 
        aluno.nota_segundo_semestre === undefined || 
        !aluno.turma_id) {
      console.error('Dados incompletos:', aluno);
      throw new Error("Dados do aluno incompletos");
    }

    // Ajusta a data para o formato correto do input
    const dataNascimento = new Date(aluno.data_nascimento);
    console.log('Data original:', aluno.data_nascimento);
    console.log('Data convertida:', dataNascimento);
    
    dataNascimento.setMinutes(dataNascimento.getMinutes() + dataNascimento.getTimezoneOffset());
    const dataFormatada = dataNascimento.toISOString().split('T')[0];
    console.log('Data formatada:', dataFormatada);

    // Preenchendo o formulário de edição
    document.getElementById("aluno-id").value = aluno.id;
    document.getElementById("update-nome").value = aluno.nome;
    document.getElementById("update-data_nascimento").value = dataFormatada;
    document.getElementById("update-nota_primeiro_semestre").value = aluno.nota_primeiro_semestre;
    document.getElementById("update-nota_segundo_semestre").value = aluno.nota_segundo_semestre;
    document.getElementById("update-turma_id").value = aluno.turma_id;

    // Exibindo o pop-up para edição
    document.getElementById("edit-popup").style.display = "block";
  } catch (error) {
    console.error("Erro detalhado ao editar aluno:", error);
    console.error("Stack trace:", error.stack);
    alert(`Erro ao carregar dados do aluno: ${error.message}`);
  }
}

// Função de Atualizar Aluno
document.getElementById("update-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const form = e.target;
    const alunoId = document.getElementById("aluno-id").value;
    
    if (!alunoId) {
      throw new Error("ID do aluno não encontrado");
    }

    const data = {
      nome: form["update-nome"].value,
      data_nascimento: form["update-data_nascimento"].value,
      nota_primeiro_semestre: parseFloat(form["update-nota_primeiro_semestre"].value),
      nota_segundo_semestre: parseFloat(form["update-nota_segundo_semestre"].value),
      turma_id: parseInt(form["update-turma_id"].value)
    };

    console.log('Dados para atualização:', data);

    const response = await fetch(`${API_URL}/${alunoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ao atualizar aluno: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('Resposta da atualização:', result);
    
    alert("Aluno atualizado com sucesso!");
    form.reset();

    // Fechar o pop-up após a atualização
    document.getElementById("edit-popup").style.display = "none";
    
    // Atualizar a lista de alunos
    document.getElementById("listar-alunos").click();
  } catch (error) {
    console.error("Erro detalhado ao atualizar aluno:", error);
    console.error("Stack trace:", error.stack);
    alert(`Erro ao atualizar aluno: ${error.message}`);
  }
});

// Função de Excluir Aluno
async function excluirAluno(id) {
  if (!confirm("Tem certeza que deseja excluir este aluno?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error(`Erro ao excluir aluno: ${response.status}`);
    }

    const result = await response.json();
    alert("Aluno excluído com sucesso!");
    console.log(result);

    // Atualizar a lista de alunos
    document.getElementById("listar-alunos").click();
  } catch (error) {
    console.error("Erro ao excluir aluno:", error);
    alert("Erro ao excluir aluno. Por favor, tente novamente.");
  }
}

// Função para fechar o pop-up de edição
document.getElementById("close-popup").addEventListener("click", () => {
  document.getElementById("edit-popup").style.display = "none";
});