
/* ====================================================== */
/* ====================== VARIAVEIS ===================== */
/* ====================================================== */
 
let tarefas = [];  
let novasTarefas = [];
let horarioInicial;
let inicioTarefa;
let finalTarefa;
let duracaoString;
let dropAcionado = false;           // impede que o drop seja acionado mais de uma vez seguida
let posicaoInicialItemMovimentado;
let posicaoFinalItemMovimentado;  
let enderecoLixeira = "images/delete_transparente.png";  



/* ====================================================== */
/* ================ COLETA VALORES INICIAIS ============= */
/* ====================================================== */
 

document.querySelector(".btn-enviar").addEventListener("click", function(e) { 

    e.preventDefault();
    
    if (document.getElementById("horario-inicial").value !== "") {
        if (horarioInicial != document.getElementById("horario-inicial").value){ 
            horarioInicial = document.getElementById("horario-inicial").value; 
            if (tarefas.length > 0) {
                atualizaHorarios (); 
            }
        }
        
        document.getElementById("nome-tarefa").focus(); 
    }
    
    if (document.getElementById("nome-tarefa").value !== "" && document.getElementById("duracao").value !== "") { 
         
        calculaHorarios(1, tarefas.length); 

        let tarefa = {
            posicao: tarefas.length, 
            nome: document.getElementById("nome-tarefa").value, 
            duracao: document.getElementById("duracao").value, 
            inicio: inicioTarefa, 
            final: finalTarefa
        };
        
        tarefas.push(tarefa);      

        let textoTarefa = `
            <img class="lixeiras" id="lixeira-${tarefas.length-1}" src=${enderecoLixeira}>
            <span class="espacamento">${tarefa.inicio}</span>
            <span class="espacamento">${tarefa.nome}</span>
            <span class="espacamento">${duracaoString}</span>
        `;
  
        document.querySelector(".tarefas").insertAdjacentHTML("beforeend", `
            <p 
                class="tarefa-item animacao-sobe" 
                draggable="true" 
                id="tarefa-${tarefas.length-1}">
                ${textoTarefa}
            </p>
        `);
         
        document.getElementById("nome-tarefa").value = "";
        document.getElementById("duracao").value = "";
        document.getElementById("nome-tarefa").focus(); 

        if (document.querySelector(".tarefa-atual")) {
            document.querySelector(".tarefa-atual").classList.remove("tarefa-atual");
        }

        deletar();

        dragAndDrop();  

        salvamentoLocal();
    }
});



/* ====================================================== */
/* =================== CALCULA HORÁRIOS ================= */
/* ====================================================== */


function calculaHorarios (num, index) {  
    
    index === 0 ? inicioTarefa = horarioInicial : inicioTarefa = tarefas[index-1].final;
  
    let inicioTarefaTotal = inicioTarefa.split(":");
    let inicioTarefaHoras = Number(inicioTarefaTotal[0]);
    let inicioTarefaMinutos = Number(inicioTarefaTotal[1]);

    let duracaoTotal;
    
    if (num === 1) {
        duracaoTotal = document.getElementById("duracao").value.split(":");
    } else if (num === 2) {
        duracaoTotal = tarefas[index].duracao.split(":"); 
    }
 
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
   


/* ====================================================== */
/* ===================== DRAG AND DROP ================== */
/* ====================================================== */


function dragAndDrop() {
    
    document.querySelectorAll(".tarefa-item").forEach(tarefa => {

        tarefa.addEventListener('dragstart', function (event) {   
            event.dataTransfer.setDragImage(event.target, window.outerWidth, window.outerHeight); 
            dropAcionado = false;   
            this.classList.add("tarefa-selecionada");
            this.classList.remove("animacao-sobe");
        });
 
        tarefa.addEventListener('dragend', function () {     
            this.classList.remove('tarefa-selecionada'); 
        });
    }); 

    document.querySelector(".tarefas").addEventListener("dragover", function (event) {
        event.preventDefault(); 
        let elementoSeguinte = pegaElementoSeguinte(event.clientY);
        const cardBeingDragged = document.querySelector(".tarefa-selecionada");  

        if (elementoSeguinte === null) {
            document.querySelector(".tarefas").appendChild(cardBeingDragged); 
        }
        else { 
            document.querySelector(".tarefas").insertBefore(cardBeingDragged, elementoSeguinte); 
        } 
        
    }); 

    function pegaElementoSeguinte(y) {

        let listaTarefas = [...document.querySelectorAll(".tarefa-item:not(.tarefa-selecionada)")];

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

    
    document.querySelector(".tarefas").addEventListener("drop", function  (event) {

        event.preventDefault();   
        
        
        if (dropAcionado === false) {       // impede que o evento seja acionado mais de uma vez seguida
                   
            posicaoInicialItemMovimentado = document.querySelector(".tarefa-selecionada").id.split("-")[1]; 

            for (let i = 0; i < document.querySelectorAll(".tarefa-item").length; i++) {

                let idNumber = document.querySelectorAll(".tarefa-item")[i].id.split("-")[1]; 

                if (posicaoInicialItemMovimentado == idNumber) {
                    posicaoFinalItemMovimentado = i;
                }
 
            }
  

            if (posicaoFinalItemMovimentado != posicaoInicialItemMovimentado) {
 
                dropAcionado = true;
    
                let itemMovimentado = tarefas.splice(posicaoInicialItemMovimentado, 1);  
  
                tarefas.splice(posicaoFinalItemMovimentado, 0, itemMovimentado[0]);
    
                tarefas.forEach((tarefa, index) => {
                    document.getElementById(`lixeira-${index}`).src = "images/delete_transparente.png";
                    enderecoLixeira = "images/delete_transparente.png";  
 
                    if (document.querySelector(".tarefa-atual")) {
                        document.querySelector(".tarefa-atual").classList.remove("tarefa-atual");
                    }
              
                });
    
                atualizaHorarios ();
                
                deletar();
 
            } 
        }
    }); 
}


/* ====================================================== */
/* ================== ATUALIZA HORÁRIOS ================= */
/* ====================================================== */

function atualizaHorarios () {
  
    for (let i = 0; i < tarefas.length; i++) {
        
        calculaHorarios (2, i);
        
        tarefas[i].posicao = i; 
        tarefas[i].inicio = inicioTarefa;
        tarefas[i].final = finalTarefa;
          
        document.querySelectorAll(".tarefa-item")[i].id = `tarefa-${i}`;
 
        let novoTexto = `
            <img class="lixeiras" id="lixeira-${i}" src=${enderecoLixeira}>
            <span class="espacamento">${tarefas[i].inicio}</span>
            <span class="espacamento">${tarefas[i].nome}</span>
            <span class="espacamento">${duracaoString}</span>
        `;

        document.getElementById(`tarefa-${i}`).innerHTML = novoTexto;
 
    }

    salvamentoLocal(); 
}
 
   
    
/* ====================================================== */
/* ======================= DELETAR ====================== */
/* ====================================================== */

function deletar() {  
    
    document.querySelectorAll(".lixeiras").forEach((lixeira, index) => {
        document.getElementById(`lixeira-${index}`).src = "images/delete_transparente.png";
        enderecoLixeira = "images/delete_transparente.png";  
    });


    document.querySelectorAll(".tarefa-item").forEach(tarefa => { 
  
        tarefa.addEventListener('mouseenter', function(event) {
            document.getElementById(`lixeira-${event.target.id.split("-")[1]}`).src = "images/delete.png";
            enderecoLixeira = "images/delete.png"; 
        });

        tarefa.addEventListener('mouseleave', function(event) {
            document.getElementById(`lixeira-${event.target.id.split("-")[1]}`).src = "images/delete_transparente.png";
            enderecoLixeira = "images/delete_transparente.png";  
        });
    });


    document.querySelectorAll(".lixeiras").forEach(lixeira => {  
        if (!lixeira.classList.contains("click")) {
            lixeira.addEventListener('click', lixeiraClick); 
            lixeira.classList.add("click");
        }
    });

 

    function lixeiraClick (event) {
    
        event.stopPropagation(); 
  
        document.getElementById(`tarefa-${event.target.id.split("-")[1]}`).remove(); 
        tarefas.splice(event.target.id.split("-")[1], 1);   


        document.querySelectorAll(".lixeiras").forEach(lixeira => {  
            if (lixeira.classList.contains("click")) { 
                lixeira.removeEventListener('click', lixeiraClick);
                lixeira.classList.remove("click"); 
            }
        });
 
        atualizaHorarios ();
        
        deletar();
    }
  
} 



/* ====================================================== */
/* ===================== LOCAL STORAGE ================== */
/* ====================================================== */
 

function salvamentoLocal () {
          
    window.localStorage.clear();
    window.localStorage.setItem('tarefasLS', JSON.stringify(tarefas));
    window.localStorage.setItem('horarioInicial', JSON.stringify(horarioInicial));
}


window.onload = function() { 
      
    if (localStorage.getItem('horarioInicial') != undefined) {   
        document.getElementById("horario-inicial").value = JSON.parse(localStorage.getItem("horarioInicial"));
    }

    if (document.querySelector(".tarefas").childNodes.length === 3 && localStorage.getItem('tarefasLS')) { 
        
        let tarefasLS = JSON.parse(localStorage.getItem('tarefasLS'));
        horarioInicial = JSON.parse(localStorage.getItem("horarioInicial"));
  
        for (let i = 0; i < tarefasLS.length; i++) { 

            tarefas[i] = tarefasLS[i]; 

            let duracaoHoras = Number(tarefas[i].duracao.split(":")[0]);
            let duracaoMinutos = Number(tarefas[i].duracao.split(":")[1]);

            formatacaoDuracao(duracaoHoras, duracaoMinutos);

            let novoTexto = `
            <img class="lixeiras" id="lixeira-${i}" src=${enderecoLixeira}>
            <span class="espacamento">${tarefas[i].inicio}</span>
            <span class="espacamento">${tarefas[i].nome}</span>
            <span class="espacamento">${duracaoString}</span>
            `;
  
            document.querySelector(".tarefas").insertAdjacentHTML("beforeend", `
                <p 
                    class="tarefa-item animacao-sobe" 
                    draggable="true" 
                    id="tarefa-${i}">
                    ${novoTexto}
                </p>
            `);
        }  
    }
   
    dragAndDrop();  
    deletar();

    let alarmeTocou = false;
    setInterval(hora, 1000); 
    let indexTarefaAtual = -1;

    function hora () {  
 
        let horaAtual = new Date().toLocaleTimeString(navigator.language, {hourCycle: 'h23', hour: "numeric", minute: "numeric"}); 
        
        if (document.querySelector(".tarefa-atual")) {
            indexTarefaAtual = document.querySelector(".tarefa-atual").id.split("-")[1]; 
        }

        for (let i = 0; i < tarefas.length; i++) {
  
            if (horaAtual === tarefas[i].inicio) {
                     
                document.getElementById(`tarefa-${i}`).classList.add("tarefa-atual");
                indexTarefaAtual = i;

                if (alarmeTocou === false) {
                    alarme();
                }
            }     
            else if (indexTarefaAtual < tarefas.length && indexTarefaAtual != -1 && horaAtual == tarefas[indexTarefaAtual].final) {

                console.log("entrou no if, indexTarefaAtual = " + indexTarefaAtual);
                if (document.querySelector(".tarefa-atual")) {
                    document.querySelector(".tarefa-atual").classList.remove("tarefa-atual"); 
                    alarmeTocou = false; 
                }
            }
        }


        tarefas.forEach((tarefa, index) => {

            durante(tarefa.inicio.split(":")[0], tarefa.inicio.split(":")[1], tarefa.final.split(":")[0], tarefa.final.split(":")[1], index);
        });

 
        function durante(horaInicioTarefa, minutoInicioTarefa, horaFinalTarefa, minutoFinalTarefa, index) {

            let horaAtual = new Date().toLocaleTimeString(navigator.language, {hourCycle: 'h23', hour: "numeric", minute: "numeric"});
        
            let hora = horaAtual.split(":")[0];
            let minutos = horaAtual.split(":")[1]; 
         
            let horarioAtual = Date.UTC(2022, 10, 15, hora, minutos);
            let começoTarefa = Date.UTC(2022, 10, 15, horaInicioTarefa, minutoInicioTarefa);
            let fimTarefa = Date.UTC(2022, 10, 15, horaFinalTarefa, minutoFinalTarefa);
 
            if (horarioAtual >= começoTarefa && horarioAtual < fimTarefa) {

                document.getElementById(`tarefa-${index}`).classList.add("tarefa-atual");
            }
        } 
    }

    function alarme() {

        let alarme = new Audio('sounds/alarme.mp3');
        alarme.volume = 0.05;
        alarme.play(); 
        
        alarmeTocou = true;    
        deletar();
    }

}
 