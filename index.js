
/* ====================================================== */
/* ====================== VARIAVEIS ===================== */
/* ====================================================== */
 
let tarefas = [];  
let horarioInicial;
let inicioTarefa;
let finalTarefa;
let duracaoString;

document.querySelector(".button").addEventListener("click", function(e) {

    e.preventDefault();
    
    if (document.getElementById("horario-inicial").value !== "") {
        horarioInicial = document.getElementById("horario-inicial").value; 
    }
    
    if (document.getElementById("tarefa").value !== "" && document.getElementById("duracao").value !== "") { 
        
        calculaHorarios(); 

        let tarefa = {nome: document.getElementById("tarefa").value, duracao: document.getElementById("duracao").value, inicio: inicioTarefa, final: finalTarefa};
        
        tarefas.push(tarefa);     
        
        document.querySelector(".tarefas").insertAdjacentHTML("beforeend", `<p class="lista-tarefas" draggable="true" id="tarefa-${tarefas.length}"></p>`);
        // document.querySelector(".tarefas").insertAdjacentHTML("beforeend", `<p class="dropzones">&nbsp;</p>`);

        // let textoTarefa = `${tarefa.inicio} - ${tarefa.nome} (${tarefa.duracao.replace(":", "h") + "min"})`;
        let textoTarefa = `${tarefa.inicio} - ${tarefa.nome} (${duracaoString})`;

        document.getElementById(`tarefa-${tarefas.length}`).innerText = textoTarefa;
        
        console.log(tarefas);

        document.getElementById("tarefa").value = "";
        document.getElementById("duracao").value = "";
        document.getElementById("tarefa").focus();

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

    console.log("finalTarefa = " + finalTarefa); 
 
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

    // let dropzone = true;

    let listaTarefas = document.querySelectorAll(".lista-tarefas");
        
    listaTarefas.forEach(tarefa => {

        tarefa.addEventListener('dragstart', function () {     
            this.classList.add("is-dragging");
        });
 
        tarefa.addEventListener('dragend', function () {    
            this.classList.remove('is-dragging');
            // this.classList.remove('dropzones');
        });
    });
  

    document.querySelectorAll(".tarefas").forEach(dropzone => {

        dropzone.addEventListener("dragenter", function (event) {
            event.preventDefault();
        });
    
        dropzone.addEventListener("dragover", function (event) {
            event.preventDefault();
            // this.insertAdjacentHTML("beforeend", cardBeingDragged.innerHTML);
            // const cardBeingDragged = document.querySelector(".is-dragging");              
            // this.appendChild(cardBeingDragged); 
        });

        dropzone.addEventListener("drop", function () { 
            const cardBeingDragged = document.querySelector(".is-dragging");  
            this.appendChild(cardBeingDragged);  
            this.classList.remove('dropzones');

            // if (this.nextElementSibling !== '<p class="dropzones">&nbsp;</p>') {
            //     cardBeingDragged.insertAdjacentHTML("afterend", `<p class="dropzones laranja">&nbsp;</p>`);
            // }

            // if (this.previousElementSibling !== '<p class="dropzones">&nbsp;</p>') {
            // cardBeingDragged.insertAdjacentHTML("beforebegin", `<p class="dropzones laranja">&nbsp;</p>`);
            // }
        });
    });
  
}


