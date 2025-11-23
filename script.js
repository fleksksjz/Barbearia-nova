document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("horarios-container");
  const modal = document.getElementById("modal-agendamento");
  const closeModal = document.getElementById("close-modal");
  const form = document.getElementById("form-agendamento");
  const msg = document.getElementById("msg");
  const dataInput = document.getElementById("data");

  const adminPanel = document.getElementById("admin-panel");
  const closeAdmin = document.getElementById("close-admin");
  if (closeAdmin) {
    closeAdmin.addEventListener("click", () => {
      adminPanel.style.display = "none";
    });
  }

  const listaAgendamentos = document.getElementById("lista-agendamentos");
  const btnLimpar = document.getElementById("btn-limpar");

  const horarios = ["08:00","09:00","10:00","11:00","12:00",
                    "13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

  const formatDate = d => new Date(d).toISOString().split('T')[0];

  // Configura data mínima (hoje)
  if (dataInput) dataInput.min = formatDate(new Date());

  function renderHorarios(data) {
    if (!container) return;
    if (!data) {
      container.innerHTML = "<p style='color:#999; padding:20px;'>📅 Selecione uma data acima</p>";
      return;
    }
    container.innerHTML = "";

    let agendamentos = JSON.parse(localStorage.getItem("agendamentos")||"[]");
    let ocupados = agendamentos.filter(a=>a.data===data).map(a=>a.hora);

    horarios.forEach(hora=>{
      const div = document.createElement("div");
      div.className = "balaozinho";
      div.innerText = hora;
      div.dataset.hora = hora;

      if(ocupados.includes(hora)){
        div.classList.add("ocupado");
        div.innerHTML = `${hora} <span style="font-size:11px">❌</span>`;
      } else {
        div.addEventListener("click", ()=>{
          document.querySelectorAll(".balaozinho").forEach(b=>b.classList.remove("ativo"));
          div.classList.add("ativo");
          if (form) {
            form.hora.value = hora;
            form.data.value = data;
          }
          if (modal) modal.style.display = "flex";
        });
      }

      container.appendChild(div);
    });
  }

  if (dataInput) {
    dataInput.addEventListener("change", ()=>{
      renderHorarios(formatDate(dataInput.value));
      if (msg) msg.innerText = "";
    });
  }

  if (closeModal) closeModal.addEventListener("click", ()=> modal.style.display="none");
  window.addEventListener("click", e=>{
    if (e.target === modal) modal.style.display="none";
  });

  if (form) {
    form.addEventListener("submit", e=>{
      e.preventDefault();
      const dados = new FormData(form);
      const agendamento = {
        nome: dados.get("nome"),
        telefone: dados.get("telefone"),
        servico: dados.get("servico"),
        data: dados.get("data"),
        hora: dados.get("hora"),
        timestamp: new Date().toLocaleString('pt-BR')
      };

      let agendamentos = JSON.parse(localStorage.getItem("agendamentos")||"[]");
      if(agendamentos.some(a=>a.data===agendamento.data && a.hora===agendamento.hora)){
        if (msg) {
          msg.innerText="⚠️ Horário já reservado nesse dia";
          msg.style.color="#ffcc00";
          msg.style.display = "block";
        }
        renderHorarios(agendamento.data);
        setTimeout(()=>{ if (msg) msg.style.display="none"; }, 4000);
        return;
      }

      agendamentos.push(agendamento);
      localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
      modal.style.display="none";
      form.reset();

      if (msg) {
        msg.innerText="✅ Agendamento confirmado com sucesso!";
        msg.style.color="#00ff7f";
        msg.style.display = "block";
      }

      renderHorarios(agendamento.data);
      setTimeout(()=>{ if (msg) msg.style.display="none"; }, 5000);
    });
  }

  // --- Admin ---
  function renderAdmin(){
    let lista = JSON.parse(localStorage.getItem("agendamentos")||"[]");
    if(!listaAgendamentos) return;
    if(lista.length===0){
      listaAgendamentos.innerHTML = "<p style='color:#999; padding:20px;'>Nenhum agendamento salvo</p>";
      return;
    }

    // ordenar por data e horário
    lista.sort((a,b)=>{
      if(a.data===b.data) return a.hora.localeCompare(b.hora);
      return a.data.localeCompare(b.data);
    });

    let tabela = `
    <div style="overflow-x: auto; margin: 20px 0;">
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr style="background:#1a1a1a; border-bottom:2px solid #f5c518;">
            <th style="padding:12px; text-align:left; color:#FFD93D;">Nome</th>
            <th style="padding:12px; text-align:left; color:#FFD93D;">Telefone</th>
            <th style="padding:12px; text-align:left; color:#FFD93D;">Serviço</th>
            <th style="padding:12px; text-align:left; color:#FFD93D;">Data</th>
            <th style="padding:12px; text-align:left; color:#FFD93D;">Horário</th>
            <th style="padding:12px; text-align:center; color:#FFD93D;">Ação</th>
          </tr>
        </thead>
        <tbody>`;

    lista.forEach((a, index)=>{
      tabela += `<tr style="border-bottom:1px solid #333;">
        <td style="padding:10px;">${a.nome}</td>
        <td style="padding:10px;">${a.telefone}</td>
        <td style="padding:10px;">${a.servico}</td>
        <td style="padding:10px;">${a.data}</td>
        <td style="padding:10px; font-weight:bold; color:#FFD93D;">${a.hora}</td>
        <td style="padding:10px; text-align:center;">
          <button onclick="removerAgendamento('${a.data}','${a.hora}')" 
                  style="background:#e74c3c; color:#fff; border:none; padding:6px 12px; 
                         border-radius:5px; cursor:pointer; font-size:0.85rem;">
            🗑️ Remover
          </button>
        </td>
      </tr>`;
    });

    tabela += `</tbody></table></div>`;
    listaAgendamentos.innerHTML = tabela;
  }

  // Remover agendamento individual
  window.removerAgendamento = function(data, hora) {
    if(confirm(`Deseja remover o agendamento de ${data} às ${hora}?`)){
      let agendamentos = JSON.parse(localStorage.getItem("agendamentos")||"[]");
      agendamentos = agendamentos.filter(a => !(a.data===data && a.hora===hora));
      localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
      renderAdmin();
      if (dataInput) renderHorarios(formatDate(dataInput.value));
      alert("Agendamento removido!");
    }
  };

  // Botão Limpar Todos
  if (btnLimpar) {
    btnLimpar.addEventListener("click", ()=>{
      if(confirm("⚠️ Tem certeza que deseja limpar TODOS os agendamentos?")){
        localStorage.removeItem("agendamentos");
        renderAdmin();
        if (dataInput) renderHorarios(formatDate(dataInput.value));
        alert("✅ Todos os agendamentos foram removidos!");
      }
    });
  }

  // Acesso admin (5 cliques no footer + senha)
  let clicks=0;
  const footer = document.getElementById("footer");
  if (footer) {
    footer.addEventListener("click", ()=>{
      clicks++;
      if(clicks>=5){
        const senha = prompt("🔐 Senha do administrador:");
        if(senha==="0956"){
          renderAdmin();
          if (adminPanel) adminPanel.style.display="flex";
        } else {
          alert("❌ Senha incorreta!");
        }
        clicks=0;
      }
    });
  }

  // Inicializa com hoje
  if (dataInput) {
    dataInput.value = formatDate(new Date());
    renderHorarios(dataInput.value);
  }
}); // end DOMContentLoaded

// Toggle menu mobile
function toggleMenu() {
  const menu = document.getElementById("nav-links");
  if (menu) menu.classList.toggle("open");
}

// Fechar menu ao clicar em link
function closeMenu() {
  const menu = document.getElementById("nav-links");
  if (menu) menu.classList.remove("open");
}

/* ======= Toggle serviços / galeria - FUNÇÃO ÚNICA E ROBUSTA ======= 
   - Aceita chamada via onclick="toggleSection('id', this)"
   - Aceita botões .btn-ver sem data-target (inferência pelo texto) 
*/
function toggleSection(id, btn) {
  if (!id) return;
  const section = document.getElementById(id);
  if (!section) return;

  const button = btn || document.querySelector(`.btn-ver[data-target="${id}"]`) || null;

  section.classList.toggle("active");

  // atualiza texto do botão se existir referência
  if (button) {
    const openedText = button.getAttribute('data-open-text') || button.getAttribute('data-original-text')?.replace(/Ver/i,'Ocultar') || "Ocultar";
    const original = button.getAttribute('data-original-text') || button.innerText.trim();

    if (!button.getAttribute('data-original-text')) button.setAttribute('data-original-text', original);
    button.setAttribute('data-target', id);

    if (section.classList.contains("active")) {
      button.innerText = openedText;
      button.classList.add("active");
    } else {
      // restaura original (fallback)
      button.innerText = original.includes('Ocultar') ? original.replace(/Ocultar/i,'Ver') : original;
      if (id === "servicos-lista" && !original.toLowerCase().includes('serv')) button.innerText = "Ver Serviços";
      if (id === "galeria-lista" && !original.toLowerCase().includes('galer')) button.innerText = "Ver Galeria";
      button.classList.remove("active");
    }
  }
}

// Inicializa listeners para .btn-ver (sem clonar nós)
document.addEventListener("click", (e) => {
  const el = e.target.closest && e.target.closest('.btn-ver');
  if (!el) return;
  // evita duplicar comportamento se o botão usa onclick inline (onclick chamará a função também)
  const hasInline = !!el.getAttribute('onclick');
  const target = el.getAttribute('data-target') || (el.innerText.toLowerCase().includes('servic') ? 'servicos-lista' : (el.innerText.toLowerCase().includes('galer') ? 'galeria-lista' : null));
  if (!target) return;

  // se existe onclick inline, deixamos ele (ele chamará toggleSection), mas também prevenimos execução duplicada:
  if (hasInline) {
    // permitir inline — não fazemos nada aqui para evitar chamar 2x
    return;
  } else {
    // previne comportamento padrão e executa toggle
    e.preventDefault();
    toggleSection(target, el);
  }
});
function abrirAgendamento() {
  const sec = document.getElementById("agendamento");
  sec.scrollIntoView({ behavior: "smooth" });
}
