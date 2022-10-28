
/* ====================================================== */
/* ====================== VARIAVEIS ===================== */
/* ====================================================== */
 
let tarefas = [];  
let horarioInicial;
let inicioTarefa;
let finalTarefa;

document.querySelector(".button").addEventListener("click", function(e) {

    e.preventDefault();
    
    if (document.getElementById("horario-inicial").value !== "") {
        horarioInicial = document.getElementById("horario-inicial").value; 
    }
    
    if (document.getElementById("tarefa").value !== "" && document.getElementById("duracao").value !== "") { 
        
        calculaHorarios(); 

        let tarefa = {nome: document.getElementById("tarefa").value, duracao: document.getElementById("duracao").value, inicio: inicioTarefa, final: finalTarefa};
        
        tarefas.push(tarefa);     
        
        document.querySelector(".tarefas").insertAdjacentHTML("beforeend", `<p class="lista-tarefas" id="tarefa-${tarefas.length}"></p>`);

        let textoTarefa = `${tarefa.inicio} - ${tarefa.nome} (${tarefa.duracao.replace(":", "h") + "min"})`;

        document.getElementById(`tarefa-${tarefas.length}`).innerText = textoTarefa;
        
        console.log(tarefas);

        document.getElementById("tarefa").value = "";
        document.getElementById("duracao").value = "";
        document.getElementById("tarefa").focus();
    }
});


function calculaHorarios () { 

    tarefas.length === 0 ? inicioTarefa = horarioInicial : inicioTarefa = tarefas[tarefas.length-1].final;

    let inicioTarefaTotal = inicioTarefa.split(":");
    let inicioTarefaHoras = Number(inicioTarefaTotal[0]);
    let inicioTarefaMinutos = Number(inicioTarefaTotal[1]);

    let duracaoTotal = document.getElementById("duracao").value.split(":");
    let duracaoHoras = Number(duracaoTotal[0]);
    let duracaoMinutos = Number(duracaoTotal[1]);
        
    let horaExtra = 0;

    let somaMinutos = inicioTarefaMinutos + duracaoMinutos;

    if (somaMinutos > 59) {        
        somaMinutos = somaMinutos - 60;
        horaExtra++; 
    }

    let somaHoras = inicioTarefaHoras + duracaoHoras + horaExtra;

    let finalTarefaParcial = [somaHoras.toString().padStart(2, "0"), ":", somaMinutos.toString().padStart(2, "0")];

    finalTarefa = finalTarefaParcial.join("");

    console.log("finalTarefa = " + finalTarefa); 
 
}