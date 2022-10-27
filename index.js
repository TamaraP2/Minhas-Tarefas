
/* ====================================================== */
/* ====================== VARIAVEIS ===================== */
/* ====================================================== */
 
let tarefas = [];
 

document.querySelector(".button").addEventListener("click", function(e) {
    e.preventDefault();
    console.log(tarefas);
    
    if (document.getElementById("tarefa").value !== "" && document.getElementById("duracao").value !== "") { 

        let tarefa = {nome: document.getElementById("tarefa").value, duracao: Number(document.getElementById("duracao").value)};

        tarefas.push(tarefa);

        document.querySelector(".tarefas").insertAdjacentHTML("afterbegin", `<p class="lista-tarefas" id="tarefa-${tarefas.length}"></p>`);
        document.getElementById(`tarefa-${tarefas.length}`).innerText = document.getElementById("tarefa").value;
    }
})