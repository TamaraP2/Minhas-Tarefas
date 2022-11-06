
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
let bool2 = false; 
let posicaoInicialItemMovimentado;
let posicaoFinalItemMovimentado;  
let enderecoLixeira = "images/delete_transparente.png"; 

document.querySelector(".btn-enviar").addEventListener("click", function(e) {

    e.preventDefault();
    
    if (document.getElementById("horario-inicial").value !== "") {
        horarioInicial = document.getElementById("horario-inicial").value; 
        if (tarefas.length != 0) {
            atualizaHorarios ();
        }
    }
    
    if (document.getElementById("tarefa").value !== "" && document.getElementById("duracao").value !== "") { 
        
        calculaHorarios(); 

        let tarefa = {posicao: tarefas.length, nome: document.getElementById("tarefa").value, duracao: document.getElementById("duracao").value, inicio: inicioTarefa, final: finalTarefa};
        
        tarefas.push(tarefa);     
        
        let textoTarefa = `<img class="lixeiras lixeira-${tarefas.length-1}" src=${enderecoLixeira}><span class="espacamento">${tarefa.inicio}</span><span class="espacamento">${tarefa.nome}</span><span class="espacamento">${duracaoString}</span>`;

        if (tarefas.length === 1 && bool2 === false) {
            document.querySelector(".tarefas").insertAdjacentHTML("beforeend", `<p class="titulos"><span class="espacamento"></span><span class="espacamento">INÍCIO</span><span class="espacamento">TAREFA</span><span class="espacamento">DURAÇÃO</span></p>`);
            bool2 = true;
        }

        document.querySelector(".tarefas").insertAdjacentHTML("beforeend", `<p class="tarefa-item" draggable="true" id="tarefa-${tarefas.length-1}">${textoTarefa}</p>`);
         
        document.getElementById("tarefa").value = "";
        document.getElementById("duracao").value = "";
        document.getElementById("tarefa").focus(); 
    
        deletar();

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
 
        deletar();
    }

    
    document.querySelector(".tarefas").addEventListener("drop", function  (event) {

        event.preventDefault();   
        
        
        if (bool === false) {       // impede que o evento seja acionado mais de uma vez seguida
                 
            posicaoInicialItemMovimentado = document.querySelector(".is-dragging").id.slice(-1); 

            for (let i = 0; i < document.querySelectorAll(".tarefa-item").length; i++) {

                let idNumber = document.querySelectorAll(".tarefa-item")[i].id.slice(-1); 

                if (posicaoInicialItemMovimentado == idNumber) {
                    posicaoFinalItemMovimentado = i;
                }
 
            }
 



            if (posicaoFinalItemMovimentado != posicaoInicialItemMovimentado) {
 
                bool = true;
    
                let itemMovimentado = tarefas.splice(posicaoInicialItemMovimentado, 1);  
  
                tarefas.splice(posicaoFinalItemMovimentado, 0, itemMovimentado[0]);
    
                tarefas.forEach((tarefa, index) => {
                    document.querySelector(`.lixeira-${index}`).src = "images/delete_transparente.png";
                    enderecoLixeira = "images/delete_transparente.png";  
                });
  
                atualizaHorarios ();
                
                deletar();
            }


        }
    });

}



function atualizaHorarios () {

    
    for (let i = 0; i < tarefas.length; i++) {
    
        i === 0 ? tarefas[i].inicio = horarioInicial : tarefas[i].inicio = tarefas[i-1].final 

        tarefas[i].posicao = i; 
        
        calculaHorarios2 (i);
        
        tarefas[i].final = finalTarefa;
 
    }

    document.querySelectorAll(".tarefa-item").forEach((cadaTarefa, index) => {
          
        cadaTarefa.id = `tarefa-${index}`;
           
        let duracaoHoras = Number(tarefas[index].duracao.split(":")[0]);
        let duracaoMin = Number(tarefas[index].duracao.split(":")[1]);

        formatacaoDuracao(duracaoHoras, duracaoMin);
   
        let novoTexto = `<img class="lixeiras lixeira-${index}" src=${enderecoLixeira}><span class="espacamento">${tarefas[index].inicio}</span><span class="espacamento">${tarefas[index].nome}</span><span class="espacamento">${duracaoString}</span>`;

        document.getElementById(`tarefa-${index}`).innerHTML = novoTexto;
        

    })

    // document.querySelector(".console").insertAdjacentHTML("beforeend", `TAREFAS FINAL = ${JSON.stringify(tarefas)} <br>`);   
 
}

  

function calculaHorarios2 (posicao) {  
    
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

   
    

function deletar() {  
  
    tarefas.forEach((tarefa, index) => {
        document.querySelector(`.lixeira-${index}`).src = "images/delete_transparente.png";
        enderecoLixeira = "images/delete_transparente.png";  
    });

    document.querySelectorAll(".tarefa-item").forEach(tarefa => { 

        tarefa.addEventListener('mouseenter', function(event) {
            document.querySelector(`.lixeira-${event.target.id.slice(-1)}`).src = "images/delete.png";
            enderecoLixeira = "images/delete.png"; 
        });

        tarefa.addEventListener('mouseleave', function(event) {
            document.querySelector(`.lixeira-${event.target.id.slice(-1)}`).src = "images/delete_transparente.png";
            enderecoLixeira = "images/delete_transparente.png";  
        });
    });

    document.querySelectorAll(".lixeiras").forEach(lixeira => { 

        lixeira.addEventListener('click', function(event) { 

            document.getElementById(`tarefa-${event.target.className.slice(-1)}`).remove();
            tarefas.splice(event.target.className.slice(-1), 1);
            console.log(`tarefa-${event.target.className.slice(-1)}`);

            atualizaHorarios ();
            
            deletar();

            // tarefas.forEach((tarefa, index) => {
            //     document.querySelector(`.lixeira-${index}`).src = "images/delete_transparente.png";
            //     enderecoLixeira = "images/delete_transparente.png";  
            // });
            
        });
    });
} 


