/**
 * Sistema de Gerenciamento de Alunos
 * Este arquivo contém todas as funcionalidades relacionadas ao gerenciamento de alunos
 * incluindo cadastro, listagem, edição e exclusão.
 * 
 * Funcionalidades principais:
 * - Cadastro de novos alunos
 * - Listagem de alunos cadastrados
 * - Edição de dados de alunos
 * - Exclusão de alunos
 * - Cálculo de médias
 * - Formatação de datas
 * - Associação com turmas
 */

// URL base da API para operações com alunos
const API_URL_ALUNOS = "https://school-system-spi.onrender.com/api/alunos";

/**
 * Função para formatar a data corretamente, considerando o timezone
 * @param {string} dateString - Data no formato ISO
 * @returns {string} Data formatada no padrão brasileiro (dd/mm/aaaa)
 * @description Ajusta a data para o timezone local e converte para o formato brasileiro
 */
function formatarData(dateString) {
    // Ajusta a data para o timezone local
    const data = new Date(dateString);
    // Adiciona o offset do timezone para compensar a conversão UTC
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString('pt-BR');
}

/**
 * Event listener para o formulário de cadastro de alunos
 * @description Coleta os dados do formulário e envia para a API
 */
document.getElementById("aluno-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  // Coleta e formata os dados do formulário
  const data = {
    nome: form.nome.value,
    data_nascimento: form.data_nascimento.value,
    nota_primeiro_semestre: parseFloat(form.nota_primeiro_semestre.value),
    nota_segundo_semestre: parseFloat(form.nota_segundo_semestre.value),
    turma_id: parseInt(form.turma_id.value)
  };

  try {
    // Envia requisição POST para a API
    const response = await fetch(API_URL_ALUNOS, {
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

/**
 * Event listener para o botão de listar alunos
 * @description Busca todos os alunos cadastrados e exibe em cards na interface
 */
document.getElementById("listar-alunos").addEventListener("click", async () => {
  try {
    const container = document.getElementById("alunos-lista");
    container.innerHTML = "<p>Carregando alunos...</p>";

    // Busca a lista de alunos na API
    const response = await fetch(API_URL_ALUNOS);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar alunos: ${response.status}`);
    }

    const alunos = await response.json();

    // Verifica se existem alunos cadastrados
    if (!alunos || alunos.length === 0) {
      container.innerHTML = "<p>Nenhum aluno cadastrado.</p>";
      return;
    }

    // Renderiza a lista de alunos em cards com suas informações
    container.innerHTML = `
      <h2>Lista de Alunos</h2>
      <div class="alunos-grid">
        ${alunos.map(aluno => {
          // Calcula a média das notas do aluno
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

/**
 * Carrega os dados de um aluno para edição
 * @param {number} id - ID do aluno a ser editado
 * @description Busca os dados do aluno na API e preenche o formulário de edição
 */
async function editarAluno(id) {
  try {
    console.log('Iniciando edição do aluno ID:', id);
    // Busca os dados do aluno na API
    const response = await fetch(`${API_URL_ALUNOS}/${id}`);
    
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

    // Validação dos campos obrigatórios
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

    // Preenche o formulário de edição com os dados do aluno
    document.getElementById("aluno-id").value = aluno.id;
    document.getElementById("update-nome").value = aluno.nome;
    document.getElementById("update-data_nascimento").value = dataFormatada;
    document.getElementById("update-nota_primeiro_semestre").value = aluno.nota_primeiro_semestre;
    document.getElementById("update-nota_segundo_semestre").value = aluno.nota_segundo_semestre;
    document.getElementById("update-turma_id").value = aluno.turma_id;

    // Exibe o popup de edição
    document.getElementById("edit-popup").style.display = "block";
  } catch (error) {
    console.error("Erro detalhado ao editar aluno:", error);
    console.error("Stack trace:", error.stack);
    alert(`Erro ao carregar dados do aluno: ${error.message}`);
  }
}

/**
 * Event listener para o formulário de atualização de aluno
 * @description Coleta os dados atualizados e envia para a API
 */
document.getElementById("update-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const form = e.target;
    const alunoId = document.getElementById("aluno-id").value;
    
    if (!alunoId) {
      throw new Error("ID do aluno não encontrado");
    }

    // Coleta e formata os dados do formulário
    const data = {
      nome: form["update-nome"].value,
      data_nascimento: form["update-data_nascimento"].value,
      nota_primeiro_semestre: parseFloat(form["update-nota_primeiro_semestre"].value),
      nota_segundo_semestre: parseFloat(form["update-nota_segundo_semestre"].value),
      turma_id: parseInt(form["update-turma_id"].value)
    };

    console.log('Dados para atualização:', data);

    // Envia requisição PUT para a API
    const response = await fetch(`${API_URL_ALUNOS}/${alunoId}`, {
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

    // Fecha o popup e atualiza a lista
    document.getElementById("edit-popup").style.display = "none";
    document.getElementById("listar-alunos").click();
  } catch (error) {
    console.error("Erro detalhado ao atualizar aluno:", error);
    console.error("Stack trace:", error.stack);
    alert(`Erro ao atualizar aluno: ${error.message}`);
  }
});

/**
 * Exclui um aluno do sistema
 * @param {number} id - ID do aluno a ser excluído
 * @description Solicita confirmação antes de excluir e atualiza a lista após a exclusão
 */
async function excluirAluno(id) {
  // Confirmação antes de excluir
  if (!confirm("Tem certeza que deseja excluir este aluno?")) {
    return;
  }

  try {
    // Envia requisição DELETE para a API
    const response = await fetch(`${API_URL_ALUNOS}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error(`Erro ao excluir aluno: ${response.status}`);
    }

    const result = await response.json();
    alert("Aluno excluído com sucesso!");
    console.log(result);

    // Atualiza a lista de alunos
    document.getElementById("listar-alunos").click();
  } catch (error) {
    console.error("Erro ao excluir aluno:", error);
    alert("Erro ao excluir aluno. Por favor, tente novamente.");
  }
}

// Evento para fechar o pop-up de edição
document.getElementById("close-popup").addEventListener("click", () => {
  document.getElementById("edit-popup").style.display = "none";
});