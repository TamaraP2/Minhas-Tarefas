
/* ====================================================== */
/* ====================== VARIAVEIS ===================== */
/* ====================================================== */
 
let tarefas = [];
// let elDuracao = document.getElementById("duracao").value;
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

        document.getElementById(`tarefa-${tarefas.length}`).innerText = document.getElementById("tarefa").value;
        
        console.log(tarefas);
    }
});


function calculaHorarios () {

    if (tarefas.length === 0) { 

        inicioTarefa = horarioInicial;
        finalTarefa = inicioTarefa; 
        
        // finalTarefa = horarioInicial + elDuracao;
        //               10:00          +     00:30
         
        
        if (inicioTarefa[0] === '0' && inicioTarefa[1] === '0') {
 
            if (document.getElementById("duracao").value[0]  === '0' && document.getElementById("duracao").value[1]  === '0') {
                
                finalTarefa = finalTarefa.split(":");
                let duracao = document.getElementById("duracao").value.split(":");

                finalTarefa[1] = duracao[1];
                finalTarefa = finalTarefa.join(":");

                console.log("final tarefa = " + finalTarefa);
                console.log("duracao = " + duracao);
                // let finalTarefa
                // duracao[1] 
            }
            // finalTarefa = finalTarefa.split(":");
            // let inicioTarefaMin = inicioTarefa.split(":").pop();

            // finalTarefa[1] = inicioTarefaMin;
 
 
        }
    }

    else  { 
        inicioTarefa = tarefas[tarefas.length-1].termino;
    }
}