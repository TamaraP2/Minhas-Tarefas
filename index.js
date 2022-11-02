
/* ====================================================== */
/* ====================== VARIAVEIS ===================== */
/* ====================================================== */
 
let tarefas = [];  
let novasTarefas = [];
let horarioInicial;
let inicioTarefa;
let finalTarefa;
let duracaoString;
let bool = false;

document.querySelector(".button").addEventListener("click", function(e) {

    e.preventDefault();
    
    if (document.getElementById("horario-inicial").value !== "") {
        horarioInicial = document.getElementById("horario-inicial").value; 
    }
    
    if (document.getElementById("tarefa").value !== "" && document.getElementById("duracao").value !== "") { 
        
        calculaHorarios(); 

        let tarefa = {posicao: tarefas.length, nome: document.getElementById("tarefa").value, duracao: document.getElementById("duracao").value, inicio: inicioTarefa, final: finalTarefa};
        
        tarefas.push(tarefa);     
        
        document.querySelector(".tarefas").insertAdjacentHTML("beforeend", `<p class="tarefa-item" draggable="true" id="tarefa-${tarefas.length-1}"></p>`);
        
        let textoTarefa = `${tarefa.inicio} - ${tarefa.nome} (${duracaoString})`;

        document.getElementById(`tarefa-${tarefas.length-1}`).innerText = textoTarefa;
          
        document.getElementById("tarefa").value = "";
        document.getElementById("duracao").value = "";
        document.getElementById("tarefa").focus(); 

        // document.querySelector(".console").insertAdjacentHTML("beforeend", `tarefas: ${JSON.stringify(tarefas[tarefas.length-1])} <br>`); 

        dragAndDrop();  

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
        
    formatacaoDuracao(duracaoHoras, duracaoMinutos);

    let horaExtra = 0;

    let somaMinutos = inicioTarefaMinutos + duracaoMinutos;

    if (somaMinutos > 59) {        
        somaMinutos = somaMinutos - 60;
        horaExtra++; 
    }

    let somaHoras = inicioTarefaHoras + duracaoHoras + horaExtra;
    
    if (somaHoras > 23) {
        somaHoras = somaHoras - 24;
    }

    let finalTarefaParcial = [somaHoras.toString().padStart(2, "0"), ":", somaMinutos.toString().padStart(2, "0")];

    finalTarefa = finalTarefaParcial.join("");
  
}


function formatacaoDuracao(duracaoHoras, duracaoMinutos) {
 
    if (duracaoHoras === 0) {
        duracaoString = duracaoMinutos.toString() + "min";
    }
    else {
        if (duracaoMinutos === 0) {
            duracaoString = duracaoHoras.toString() + "h";  
        }
        else {
            duracaoString = duracaoHoras.toString() + "h" + duracaoMinutos.toString() + "min";  
        }
    } 
}


function dragAndDrop() {
  
    document.querySelectorAll(".tarefa-item").forEach(tarefa => {

        tarefa.addEventListener('dragstart', function () {  
            bool = false;   
            this.classList.add("is-dragging");
        });
 
        tarefa.addEventListener('dragend', function () {    
            this.classList.remove('is-dragging'); 
        });
    }); 

    document.querySelector(".tarefas").addEventListener("dragover", function (event) {
        event.preventDefault(); 
        let elementoSeguinte = pegaElementoSeguinte(event.clientY);
        const cardBeingDragged = document.querySelector(".is-dragging"); 

        if (elementoSeguinte === null) {
            document.querySelector(".tarefas").appendChild(cardBeingDragged); 
        }
        else { 
            document.querySelector(".tarefas").insertBefore(cardBeingDragged, elementoSeguinte); 
        } 
        
    }); 

    function pegaElementoSeguinte(y) {
        let listaTarefas = [...document.querySelectorAll(".tarefa-item:not(.is-dragging)")];

        return listaTarefas.reduce((valorInicial, child) => {
            let retangulo = child.getBoundingClientRect();
            let metadeRetangulo = y - retangulo.top - retangulo.height / 2;

            if (metadeRetangulo < 0 && metadeRetangulo > valorInicial.offset) {
                return { offset: valorInicial, element: child}                
            }
            else {
                return valorInicial
            }
        }, {offset: Number.NEGATIVE_INFINITY}).element
    }

    
    document.querySelector(".tarefas").addEventListener("drop", function (event) { 
        
        if (bool === false) {
   
            let posicaoInicialItemMovimentado = -1;
            let posicaoFinalItemMovimentado; 

            for (let i = 0; i < document.querySelectorAll(".tarefa-item").length; i++) {

                let idNumber = document.querySelectorAll(".tarefa-item")[i].id.slice(-1); 

                if (idNumber !== i && posicaoInicialItemMovimentado === -1) {
                    posicaoInicialItemMovimentado = i;  
                }
 
                if (idNumber == posicaoInicialItemMovimentado) {
                    posicaoFinalItemMovimentado = i;  
                } 
            }
 
            bool = true;
  
            let itemMovimentado = tarefas.splice(posicaoInicialItemMovimentado, 1);  

            tarefas.splice(posicaoFinalItemMovimentado, 0, itemMovimentado[0]);

            // document.querySelector(".console").insertAdjacentHTML("beforeend", `TAREFAS DEPOIS = ${JSON.stringify(tarefas)} <br>`);  
            // console.log("tarefas após splice: " + JSON.stringify(tarefas));
            // FALTA RECALCULAR HORARIOS e ATUALIZAR IDS
            
            recalculaHorarios ();
        }
    });

}



function recalculaHorarios () {

    
    for (let i = 0; i < tarefas.length; i++) {

        i === 0 ? tarefas[i].inicio = horarioInicial : tarefas[i].inicio = tarefas[i-1].final 

        tarefas[i].posicao = i; 
        
        calculaHorarios2 (i);
        
        tarefas[i].final = finalTarefa;
 
    }

    document.querySelectorAll(".tarefa-item").forEach((cadaTarefa, index) => {

        cadaTarefa.id = `tarefa-${index}`;
          
        let horarioInicioTarefa = tarefas[index].inicio;  
        let texto = document.getElementById(`tarefa-${index}`).innerText.slice(5); 
        let novoTexto = horarioInicioTarefa + texto; 

        document.getElementById(`tarefa-${index}`).innerText = novoTexto;
    })

    document.querySelector(".console").insertAdjacentHTML("beforeend", `TAREFAS FINAL = ${JSON.stringify(tarefas)} <br>`);  
}

  

function calculaHorarios2 (posicao) {  
  
    // novasTarefas.length === 0 ? inicioTarefa = horarioInicial : inicioTarefa = novasTarefas[novasTarefas.length-1].final;

    let inicioTarefaTotal = tarefas[posicao].inicio.split(":");  
    let inicioTarefaHoras = Number(inicioTarefaTotal[0]);
    let inicioTarefaMinutos = Number(inicioTarefaTotal[1]); 

    let duracaoTotal = tarefas[posicao].duracao.split(":");  
    let duracaoHoras = Number(duracaoTotal[0]);
    let duracaoMinutos = Number(duracaoTotal[1]); 
         
    let horaExtra = 0;

    let somaMinutos = inicioTarefaMinutos + duracaoMinutos;  

    if (somaMinutos > 59) {        
        somaMinutos = somaMinutos - 60;
        horaExtra++; 
    }

    let somaHoras = inicioTarefaHoras + duracaoHoras + horaExtra; 
    
    if (somaHoras > 23) {
        somaHoras = somaHoras - 24;
    }

    let finalTarefaParcial = [somaHoras.toString().padStart(2, "0"), ":", somaMinutos.toString().padStart(2, "0")];  

    finalTarefa = finalTarefaParcial.join("");   
  
}

 









// function novasPosicoesTarefas() {
  
//     let listaTarefas = [...document.querySelectorAll(".tarefa-item")];

//     document.querySelector(".console").insertAdjacentHTML("beforeend", `ENTROU novasPosicoesTarefas() <br>`); 
//     document.querySelector(".console").insertAdjacentHTML("beforeend", `tarefas: ${JSON.stringify(tarefas)} <br>`); 
    
//     novasTarefas = [...tarefas];
    
//     document.querySelector(".console").insertAdjacentHTML("beforeend", `novas tarefas: ${JSON.stringify(novasTarefas)} <br>`); 

//     novasTarefas.forEach((tarefa, index) => {

//         document.querySelector(".console").insertAdjacentHTML("beforeend", `ENTROU NO FOREACH DE NOVAS TAREFAS <br>`); 
        
//         document.querySelector(".console").insertAdjacentHTML("beforeend", `ANTES - novas tarefas[${index}]: ${JSON.stringify(novasTarefas[index])} <br>`); 

//         calculaHorarios2(index);
//         tarefa.inicio = inicioTarefa; 
//         tarefa.final = finalTarefa;
//         document.querySelectorAll(".tarefa-item")[index].id = `tarefa-${index+1}`;
//         let textoTarefa = `${tarefa.inicio} - ${tarefa.nome} (${duracaoString})`; 
//         document.getElementById(`tarefa-${index+1}`).innerText = textoTarefa; 

//         document.querySelector(".console").insertAdjacentHTML("beforeend", `DEPOIS - novas tarefas[${index}]: ${JSON.stringify(novasTarefas[index])} <br>`); 
//     }); 
    
//     // for (let i = 0; i < document.querySelectorAll(".tarefa-item").length; i++) {
//     //     document.querySelectorAll(".tarefa-item").id = `tarefa-${i}`;
//     // }
 
// }