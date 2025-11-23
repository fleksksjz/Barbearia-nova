document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("horarios-container");
  const modal = document.getElementById("modal-agendamento");
  const closeModal = document.getElementById("close-modal");
  const form = document.getElementById("form-agendamento");
  const msg = document.getElementById("msg");
  const dataInput = document.getElementById("data");

  const adminPanel = document.getElementById("admin-panel");
  const closeAdmin = document.getElementById("close-admin");
  closeAdmin.addEventListener("click", ()=>{
  adminPanel.style.display = "none";
});

  const listaAgendamentos = document.getElementById("lista-agendamentos");
  const btnLimpar = document.getElementById("btn-limpar");

  const horarios = ["08:00","09:00","10:00","11:00","12:00",
                    "13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

  const formatDate = d => new Date(d).toISOString().split('T')[0];

  function renderHorarios(data) {
    if (!data) return container.innerHTML = "<p>Selecione uma data</p>";
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
        div.innerHTML = `${hora} <span style="color:#ff5555;font-size:13px">(Ocupado)</span>`;
      } else {
        div.addEventListener("click", ()=>{
          document.querySelectorAll(".balaozinho").forEach(b=>b.classList.remove("ativo"));
          div.classList.add("ativo");
          form.hora.value = hora;
          form.data.value = data;
          modal.style.display = "flex";
        });
      }

      container.appendChild(div);
    });
  }

  dataInput.addEventListener("change", ()=>renderHorarios(formatDate(dataInput.value)));

  closeModal.addEventListener("click", ()=>modal.style.display="none");
  window.addEventListener("click", e=>{if(e.target===modal) modal.style.display="none"});

  form.addEventListener("submit", e=>{
    e.preventDefault();
    const dados = new FormData(form);
    const agendamento = {
      nome: dados.get("nome"),
      telefone: dados.get("telefone"),
      servico: dados.get("servico"),
      data: dados.get("data"),
      hora: dados.get("hora")
    };

    let agendamentos = JSON.parse(localStorage.getItem("agendamentos")||"[]");
    if(agendamentos.some(a=>a.data===agendamento.data && a.hora===agendamento.hora)){
      msg.innerText="⚠️ Horário já reservado nesse dia";
      msg.style.color="#ffcc00";
      renderHorarios(agendamento.data);
      return;
    }

    agendamentos.push(agendamento);
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
    modal.style.display="none";
    msg.innerText="✅ Agendamento confirmado!";
    msg.style.color="#00ff7f";

    renderHorarios(agendamento.data);
    setTimeout(()=>msg.innerText="",4000);
  });

  // --- Admin ---
  function renderAdmin(){
    let lista = JSON.parse(localStorage.getItem("agendamentos")||"[]");
    if(lista.length===0){
      listaAgendamentos.innerHTML = "<p>Nenhum agendamento salvo</p>";
      return;
    }

    // ordenar por data e horário
    lista.sort((a,b)=>{
      if(a.data===b.data) return a.hora.localeCompare(b.hora);
      return a.data.localeCompare(b.data);
    });

    let tabela = `<table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Telefone</th>
          <th>Serviço</th>
          <th>Data</th>
          <th>Horário</th>
        </tr>
      </thead>
      <tbody>`;

    lista.forEach(a=>{
      tabela += `<tr>
        <td>${a.nome}</td>
        <td>${a.telefone}</td>
        <td>${a.servico}</td>
        <td>${a.data}</td>
        <td>${a.hora}</td>
      </tr>`;
    });

    tabela += `</tbody></table>`;
    listaAgendamentos.innerHTML = tabela;
  }

  // Botão Limpar Todos
  btnLimpar.addEventListener("click", ()=>{
    if(confirm("Tem certeza que deseja limpar todos os agendamentos?")){
      localStorage.removeItem("agendamentos");
      renderAdmin();
      renderHorarios(formatDate(dataInput.value));
    }
  });

  let clicks=0;
  document.getElementById("footer").addEventListener("click", ()=>{
    clicks++;
    if(clicks>=5){
      if(prompt("Senha admin")=="0956"){
        renderAdmin();
        adminPanel.style.display="flex";
      } else alert("Senha incorreta!");
      clicks=0;
    }
  });

  // Inicializa com hoje
  dataInput.value = formatDate(new Date());
  renderHorarios(dataInput.value);
});
document.querySelectorAll('.btn-ver').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const target = document.getElementById(targetId);
    if (target.style.display === 'block') {
      target.style.display = 'none';
      btn.textContent = 'Ver ' + btn.textContent.split(' ')[1];
    } else {
      target.style.display = 'block';
      btn.textContent = 'Esconder ' + btn.textContent.split(' ')[1];
    }
  });
});
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    const targetId = card.dataset.target;
    const section = document.getElementById(targetId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
document.querySelectorAll('.btn-ver').forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        const target = document.getElementById(targetId);

        // alterna a classe "active"
        target.classList.toggle('active');
        // alterna a classe "oculto" para manter compatibilidade
        target.classList.toggle('oculto');
    });
});
