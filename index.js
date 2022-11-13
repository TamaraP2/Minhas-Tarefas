
/* ====================================================== */
/* ====================== VARIAVEIS ===================== */
/* ====================================================== */
 
let tarefas = [];  
let novasTarefas = [];
let horarioInicial;
let inicioTarefa;
let finalTarefa;
let duracaoString;
let bool = false;           // impede que o drop seja acionado mais de uma vez seguida
let posicaoInicialItemMovimentado;
let posicaoFinalItemMovimentado;  
let enderecoLixeira = "images/delete_transparente.png";  



/* ====================================================== */
/* ================ COLETA VALORES INICIAIS ============= */
/* ====================================================== */
 

document.querySelector(".btn-enviar").addEventListener("click", function(e) { 

    e.preventDefault();
    
    if (document.getElementById("horario-inicial").value !== "") {
        horarioInicial = document.getElementById("horario-inicial").value; 
        if (tarefas.length != 0) {
            atualizaHorarios (); 
        }
        
        document.getElementById("nome-tarefa").focus(); 
    }
    
    if (document.getElementById("nome-tarefa").value !== "" && document.getElementById("duracao").value !== "") { 
        
        calculaHorarios(); 

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
    
        deletar();

        dragAndDrop();  

        salvamentoLocal();
    }
});



/* ====================================================== */
/* =================== CALCULA HORÁRIOS ================= */
/* ====================================================== */


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
   


/* ====================================================== */
/* ===================== DRAG AND DROP ================== */
/* ====================================================== */


function dragAndDrop() {
  
    document.querySelectorAll(".tarefa-item").forEach(tarefa => {

        tarefa.addEventListener('dragstart', function (event) {   
            event.dataTransfer.setDragImage(event.target, window.outerWidth, window.outerHeight); 
            bool = false;   
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
        
        
        if (bool === false) {       // impede que o evento seja acionado mais de uma vez seguida
                   
            posicaoInicialItemMovimentado = document.querySelector(".tarefa-selecionada").id.split("-")[1]; 

            for (let i = 0; i < document.querySelectorAll(".tarefa-item").length; i++) {

                let idNumber = document.querySelectorAll(".tarefa-item")[i].id.split("-")[1]; 

                if (posicaoInicialItemMovimentado == idNumber) {
                    posicaoFinalItemMovimentado = i;
                }
 
            }
  

            if (posicaoFinalItemMovimentado != posicaoInicialItemMovimentado) {
 
                bool = true;
    
                let itemMovimentado = tarefas.splice(posicaoInicialItemMovimentado, 1);  
  
                tarefas.splice(posicaoFinalItemMovimentado, 0, itemMovimentado[0]);
    
                tarefas.forEach((tarefa, index) => {
                    document.getElementById(`lixeira-${index}`).src = "images/delete_transparente.png";
                    enderecoLixeira = "images/delete_transparente.png";  
 
                    if (document.querySelector(".tarefa-atual")) {
                        document.querySelector(".tarefa-atual").classList.remove("tarefa-atual");
                    }
              
                });
  
                salvamentoLocal();

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
    
        i === 0 ? tarefas[i].inicio = horarioInicial : tarefas[i].inicio = tarefas[i-1].final 

        tarefas[i].posicao = i; 
        
        salvamentoLocal();

        calculaHorarios2 (i);
        
        tarefas[i].final = finalTarefa;
 
    }

    salvamentoLocal();

    document.querySelectorAll(".tarefa-item").forEach((cadaTarefa, index) => {
          
        cadaTarefa.id = `tarefa-${index}`;
           
        let duracaoHoras = Number(tarefas[index].duracao.split(":")[0]);
        let duracaoMin = Number(tarefas[index].duracao.split(":")[1]);

        formatacaoDuracao(duracaoHoras, duracaoMin);
   
        let novoTexto = `
            <img class="lixeiras" id="lixeira-${index}" src=${enderecoLixeira}>
            <span class="espacamento">${tarefas[index].inicio}</span>
            <span class="espacamento">${tarefas[index].nome}</span>
            <span class="espacamento">${duracaoString}</span>
        `;

        document.getElementById(`tarefa-${index}`).innerHTML = novoTexto;
         
    });
 
    deletar();
}

  
/* ====================================================== */
/* ================== CALCULA HORÁRIOS 2 ================ */
/* ====================================================== */

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

   
    
/* ====================================================== */
/* ======================= DELETAR ====================== */
/* ====================================================== */

function deletar() {  
  
    tarefas.forEach((tarefa, index) => {
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

        console.log("entrou no foreach click");

        lixeira.addEventListener('click', function(event) { 
            
        console.log("entrou no addEventListener");
                  
            console.log(event);
            document.getElementById(`tarefa-${event.target.id.split("-")[1]}`).remove();
            tarefas.splice(event.target.id.split("-")[1], 1); 

            salvamentoLocal();

            atualizaHorarios ();
            
            deletar();
        });
    });



    
    // let eventoClick = function(event) { 
            
    //     if (document.getElementById(`tarefa-${event.target.id.split("-")[1]}`)) {
    //         document.getElementById(`tarefa-${event.target.id.split("-")[1]}`).remove();
    //         tarefas.splice(event.target.id.split("-")[1], 1); 
    //     }           
    
    //     salvamentoLocal();

    //     atualizaHorarios ();
        
    //     deletar();

    // };

    // document.querySelectorAll(".lixeiras").forEach(lixeira => { 
         
    //     lixeira.removeEventListener('click', eventoClick);
         
    //     lixeira.addEventListener('click', eventoClick);
        
    // });
 
    // salvamentoLocal();
     
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
         
    //    dragAndDrop();  

    atualizaHorarios(); 

    }
 
  
    
    // setInterval(taNaHora, 1000);
    // let chamouHora = false;
    
    // function taNaHora () {

    //     let horaAtual = new Date().toLocaleTimeString(navigator.language, {hourCycle: 'h23', hour: "numeric", minute: "numeric"});
    //     let segundos = new Date().toLocaleTimeString().split(":")[2]; 

    //     if (segundos == "00" && chamouHora === false) {
    //         hora (horaAtual);
    //         deletar();
    //         chamouHora = true;
    //     }
    // }


    dragAndDrop();  
 
    let chamouDeletar = false;
    let alarmeTocou = false;
    setInterval(hora, 1000);
    
    // atualizaHorarios(); 

    function hora () {  

        let horaAtual = new Date().toLocaleTimeString(navigator.language, {hourCycle: 'h23', hour: "numeric", minute: "numeric"});
  
        tarefas.forEach((tarefa, index) => {
                 
            if (horaAtual === tarefa.inicio) {
     
                document.getElementById(`tarefa-${index}`).classList.add("tarefa-atual");
    
                if (alarmeTocou === false) {

                    let alarme = new Audio('sounds/alarme.mp3');
                    alarme.volume = 0.05;
                    alarme.play(); 

                    alarmeTocou = true;      

                    atualizaHorarios(); 

                    setTimeout(() => { 
                        alarmeTocou = false; 
                    }, 60000);    
                }               

            }         
            
            if (horaAtual === tarefa.final) { 
  
                if (document.querySelector(".tarefa-atual")) {
                    document.querySelector(".tarefa-atual").classList.remove("tarefa-atual");
                }
            }

  
        }); 
          
    } 
    
}  