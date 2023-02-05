 
/* ====================================================== */
/* ====================== VARIAVEIS ===================== */
/* ====================================================== */
 
let tarefasHoje = [];  
let todasTarefas = [];
let horarioInicial;
let inicioTarefa = "0";
let finalTarefa = "0";
let duracaoString; 
let dropAcionadoTarefasHoje = false;           // impede que o drop seja acionado mais de uma vez seguida
let dropAcionadoTodasTarefas = false;
let posicaoInicialItemMovimentado;
let posicaoFinalItemMovimentado;  
let enderecoLixeira = "images/delete_transparente.png";   
let idNovaTarefa; 
let containerInicial; 
let idItemMovimentado; 
let localDoDrop;
let idInicial;  
let tarefaSendoArrastada; 

/* ====================================================== */
/* ===================== WINDOW ONLOAD ================== */
/* ====================================================== */
  
window.onload = function() { 
       
    downloadLocalStorage();
    dragAndDrop();  
    deletar();
    editar();
    tarefaAtual();
  
}
 
/* ====================================================== */
/* ========================= SORT ======================= */
/* ====================================================== */


document.querySelector(".ordenar-duracao").addEventListener("click", function() {
 
    todasTarefas.sort((a, b) => a.duracao.localeCompare(b.duracao)); 

    atualizacaoTodasTarefas();

    atualizaLocalStorage();
    deletar();
    editar();
    dragAndDrop();  
});

 
document.querySelector(".ordenar-a-z").addEventListener("click", function() { 

    todasTarefas.sort((a, b) => a.nome.localeCompare(b.nome)); 
 
    atualizacaoTodasTarefas();

    atualizaLocalStorage();
    deletar();
    editar();
    dragAndDrop();  

});

 

 
/* ====================================================== */
/* ================ COLETA VALORES INICIAIS ============= */
/* ====================================================== */
 

document.querySelector(".btn-enviar").addEventListener("click", function(e) { 

    e.preventDefault();
    
    if (document.getElementById("horario-inicial").value !== "") {
        if (horarioInicial != document.getElementById("horario-inicial").value){ 
            horarioInicial = document.getElementById("horario-inicial").value; 
            if (tarefasHoje.length > 0) {
                atualizaHorarios (); 
            }
        }
        
        document.getElementById("nome-tarefa").focus(); 
    }
    
    if (document.getElementById("nome-tarefa").value !== "" && document.getElementById("nome-tarefa").value !== " " && document.getElementById("duracao").value !== "") { 
           
        let tarefa = {
            posicao: todasTarefas.length, 
            nome: document.getElementById("nome-tarefa").value, 
            duracao: document.getElementById("duracao").value, 
            inicio: inicioTarefa, 
            final: finalTarefa
        };
        
        idNovaTarefa = todasTarefas.length;
        todasTarefas.push(tarefa);    

        formatacaoDuracao(Number(tarefa.duracao.split(":")[0]), Number(tarefa.duracao.split(":")[1]));
  
        document.querySelector(".todas-tarefas-container").insertAdjacentHTML("beforeend", `
            <p 
                class= "tarefas-arrastaveis todas-tarefas-item animacao-sobe"  
                id="todas-tarefas-item-${idNovaTarefa}" 
                draggable="true" 
            >      
                <span id="todas-tarefas-nome-${idNovaTarefa}">${tarefa.nome}</span>
                <span id="todas-tarefas-duracao-${idNovaTarefa}">${duracaoString}</span>    
                <img 
                    class="todas-tarefas-editar" 
                    id="todas-tarefas-editar-${idNovaTarefa}" 
                    src="images/editar_transparente.png" 
                >  
                <img 
                    class="todas-tarefas-lixeiras" 
                    id="todas-tarefas-lixeira-${idNovaTarefa}" 
                    src="images/delete_transparente.png" 
                >             
                
            </p>
        `);
         

        document.getElementById("nome-tarefa").value = "";
        document.getElementById("duracao").value = "";
        document.getElementById("nome-tarefa").focus(); 
 
        deletar();

        editar();

        dragAndDrop();  
         
        atualizaLocalStorage();
        
    }
    
    if (document.querySelector(".tarefa-atual")) {
        document.querySelector(".tarefa-atual").classList.remove("tarefa-atual");
    }
});

  
 
/* ====================================================== */
/* ==================== LOCAL DO DROP =================== */
/* ====================================================== */

function defineLocalDoDrop(event, container) {

    localDoDrop = calculaLocalDrop(container, event.clientY); 
                    
    if (localDoDrop) {  
    container.insertBefore(tarefaSendoArrastada, localDoDrop);  
    } 
    else {    
        container.appendChild(tarefaSendoArrastada);   
    } 
    
    
    if (tarefasHoje.length === 0) {
        posicaoFinalItemMovimentado = 0; 
    }                  
    else if (document.querySelector(".tarefa-selecionada").previousElementSibling) {
        posicaoFinalItemMovimentado = Number(document.querySelector(".tarefa-selecionada").previousElementSibling.id.split("-")[3]); 
        posicaoFinalItemMovimentado = posicaoFinalItemMovimentado + 1;    
    }
 
}


function calculaLocalDrop(container, y) {
  
    let listaTarefas = [...container.querySelectorAll(".tarefas-arrastaveis:not(.tarefa-selecionada)")];

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



/* ====================================================== */
/* ============== ATUALIZAÇÃO TODAS TAREFAS ============= */
/* ====================================================== */

function atualizacaoTodasTarefas() {
    
    /* ======== ATUALIZAÇÃO POSIÇÕES DO TODAS TAREFAS [] ======== */

    for (let i = 0; i < todasTarefas.length; i++) {  
        todasTarefas[i].posicao = i; 
    };


    /* ======== ZEREI TODAS-TAREFAS ======== */

    while (document.querySelectorAll(".todas-tarefas-item").length != 0) {
        document.querySelector(".todas-tarefas-item").remove();
    }

    if (!document.querySelector(".todas-tarefas-container")) {

        let divTodasTarefasContainer = document.createElement('div');
        divTodasTarefasContainer.classList.add("todas-tarefas-container");
        divTodasTarefasContainer.classList.add("container");

        document.querySelector(".todas-tarefas").appendChild(divTodasTarefasContainer);
    }


    /* ======== RECOLOCAÇÃO ITENS TODAS-TAREFAS ======== */

    for (let i = 0; i < todasTarefas.length; i++) {

        formatacaoDuracao(Number(todasTarefas[i].duracao.split(":")[0]), Number(todasTarefas[i].duracao.split(":")[1]));
                 
        let textoTarefa = `
            <span id="todas-tarefas-nome-${i}">${todasTarefas[i].nome}</span>
            <span id="todas-tarefas-duracao-${i}">${duracaoString}</span>     
            <img class="todas-tarefas-editar" id="todas-tarefas-editar-${i}" src="images/editar_transparente.png">    
            <img class="todas-tarefas-lixeiras" id="todas-tarefas-lixeira-${i}" src="images/delete_transparente.png"> 
        `; 

        let p = document.createElement('p'); 
        p.classList.add("tarefas-arrastaveis");
        p.classList.add("todas-tarefas-item");
        p.draggable = true;
        p.id = `todas-tarefas-item-${i}`;
        p.innerHTML = textoTarefa;

        document.querySelector(".todas-tarefas-container").appendChild(p);
    }

    dragAndDrop();
}

 

/* ====================================================== */
/* =============== ATUALIZAÇÃO TAREFAS HOJE ============= */
/* ====================================================== */


function atualizacaoTarefasHoje() { 

    /* ======== ATUALIZAÇÃO POSIÇÕES DO TAREFAS HOJE [] ======== */

    for (let i = 0; i < tarefasHoje.length; i++) {  
        tarefasHoje[i].posicao = i; 
    };


    /* ======== ZEREI TAREFAS-HOJE ======== */
     
    while (document.querySelectorAll(".tarefas-hoje-item").length != 0) {
        document.querySelector(".tarefas-hoje-item").remove();
    }

    if (!document.querySelector(".tarefas-hoje-container")) {
        let divTarefasHojeContainer = document.createElement('div');
        divTarefasHojeContainer.classList.add("tarefas-hoje-container");
        divTarefasHojeContainer.classList.add("container");

        document.querySelector(".tarefas-hoje").appendChild(divTarefasHojeContainer);
    } 


    /* ======== RECOLOCAÇÃO ITENS TAREFAS-HOJE ======== */

    for (let i = 0; i < tarefasHoje.length; i++) {
         
        calculaHorarios (i);
          
        tarefasHoje[i].inicio = inicioTarefa;
        tarefasHoje[i].final = finalTarefa;
             
        let textoTarefa = `
            <span class="espacamento">${tarefasHoje[i].inicio}</span>
            <span class="espacamento tarefas-hoje-nome">${tarefasHoje[i].nome}</span>
            <span class="espacamento">${duracaoString}</span>
            <img class="tarefas-hoje-editar" id="tarefas-hoje-editar-${i}" src="images/editar_transparente.png">  
            <img class="tarefas-hoje-lixeiras" id="tarefas-hoje-lixeira-${i}" src="images/delete_transparente.png">
        `;


        let p = document.createElement('p');
        p.classList.add("tarefas-arrastaveis");
        p.classList.add("tarefas-hoje-item");
        p.draggable = true;
        p.id = `tarefas-hoje-item-${i}`;
        p.innerHTML = textoTarefa;

        document.querySelector(".tarefas-hoje-container").appendChild(p);

    } 

    dragAndDrop();
}

 

/* ====================================================== */
/* ===================== DRAG AND DROP ================== */
/* ====================================================== */
 
function dragAndDrop() {
       
    /* ===================== TAREFAS ================== */

    document.querySelectorAll(".tarefas-arrastaveis").forEach(tarefa => {

        tarefa.addEventListener('dragstart', function (event) {   
                   
            dropAcionadoTarefasHoje = false;   
            dropAcionadoTodasTarefas = false;
            
            this.classList.add("tarefa-selecionada");
            this.classList.remove("animacao-sobe"); 

            tarefaSendoArrastada = document.querySelector(".tarefa-selecionada");  
            containerInicial = event.target.parentElement.parentElement.outerHTML.slice(12, 17);
            idInicial = event.target.id;
    
            if (containerInicial === "todas") {
            document.querySelector(".todas-tarefas-container").style.backgroundColor = "rgba(251, 204, 208, 0.400)"; 
            }
            else {
                document.querySelector(".tarefas-hoje-container").style.backgroundColor = "rgba(251, 204, 208, 0.400)"; 
            }
        });
 
        tarefa.addEventListener('dragend', function () {     
            this.classList.remove('tarefa-selecionada'); 
            document.querySelector(".todas-tarefas-container").style.backgroundColor = "rgba(255,235,233,255)";
            document.querySelector(".tarefas-hoje-container").style.backgroundColor = "rgba(255,235,233,255)";
        });
    }); 
 
 
    /* ===================== CONTAINERS ================== */

    document.querySelectorAll(".container").forEach((container, index) => {
          
        container.addEventListener("dragover", function (event) {  

            event.preventDefault(); 
            event.stopImmediatePropagation();  
 
            if ((containerInicial == "todas" && index === 0) || (containerInicial == "taref" && index === 1)) {

                defineLocalDoDrop(event, container);
            }

            container.style.backgroundColor = "rgba(251, 204, 208, 0.400)"; 
 
        });

        container.addEventListener("dragenter", function (event) {  

            event.preventDefault(); 
           
            document.querySelector(".tarefas-hoje-titulos").style.backgroundColor = "rgba(255,235,233,255)";
            document.querySelector(".ordem").style.backgroundColor = "rgba(255,235,233,255)";
        });
  
    });  

 
 
    /* ===================== DROP TAREFAS DE HOJE ================== */
  
    document.querySelector(".tarefas-hoje-container").addEventListener("drop", function (event) {

        event.preventDefault();     
        
        if (dropAcionadoTarefasHoje === false) {       
              
            let container = document.querySelector(".tarefas-hoje-container");
            defineLocalDoDrop(event, container);
             
   
            if (containerInicial == "todas") {   // TODAS TAREFAS > TAREFAS HOJE
        
                let posicaoInicialItemMovimentado = idInicial.split("-")[3];                 
                let itemMovimentado;
                
                if (todasTarefas.length > 0 ) {
                    itemMovimentado = todasTarefas.splice(posicaoInicialItemMovimentado, 1);
                }
    
                atualizacaoTodasTarefas();                            
    
                tarefasHoje.splice(posicaoFinalItemMovimentado, 0, itemMovimentado[0]);  
  
                atualizacaoTarefasHoje();
 
            }
 

            if (containerInicial == "taref") {   //TAREFAS HOJE > TAREFAS HOJE
                    
                let posicaoInicialItemMovimentado = idInicial.split("-")[3];  
                
                for (let i = 0; i < document.querySelectorAll(".tarefas-hoje-item").length; i++) {
    
                    let idNumber = document.querySelectorAll(".tarefas-hoje-item")[i].id.split("-")[3]; 
    
                    if (posicaoInicialItemMovimentado == idNumber) {
                        posicaoFinalItemMovimentado = i;
                    } 
                }
                 
                if (posicaoFinalItemMovimentado != posicaoInicialItemMovimentado) {
                     
                    let itemMovimentado = tarefasHoje.splice(posicaoInicialItemMovimentado, 1);  
  
                    tarefasHoje.splice(posicaoFinalItemMovimentado, 0, itemMovimentado[0]);
          
                    atualizacaoTarefasHoje();

                }

            }

            atualizaLocalStorage(); 

            editar();

            deletar();

            dragAndDrop();
        }
        
        dropAcionadoTarefasHoje = true;

    });


 

    /* ===================== DROP TODAS TAREFAS ================== */
  
    document.querySelector(".todas-tarefas-container").addEventListener("drop", function (event) {

        event.preventDefault();     

        if (dropAcionadoTodasTarefas === false) {       
    
            let container = document.querySelector(".todas-tarefas-container");
            defineLocalDoDrop(event, container);
              
            if (containerInicial == "taref") {   // TAREFAS HOJE > TODAS TAREFAS
        
                let posicaoInicialItemMovimentado = idInicial.split("-")[3];                 
                let itemMovimentado;
                
                if (tarefasHoje.length > 0 ) {
                    itemMovimentado = tarefasHoje.splice(posicaoInicialItemMovimentado, 1);
                }
    
                atualizacaoTarefasHoje();
  
                todasTarefas.splice(posicaoFinalItemMovimentado, 0, itemMovimentado[0]);  
   
                atualizacaoTodasTarefas();
                    
            }

  
            if (containerInicial == "todas") {  // TODAS TAREFAS > TODAS TAREFAS
                    
                let posicaoInicialItemMovimentado = idInicial.split("-")[3];  
                
                for (let i = 0; i < document.querySelectorAll(".todas-tarefas-item").length; i++) {
    
                    let idNumber = document.querySelectorAll(".todas-tarefas-item")[i].id.split("-")[3]; 
    
                    if (posicaoInicialItemMovimentado == idNumber) {
                        posicaoFinalItemMovimentado = i;
                    } 
                }
                 
                if (posicaoFinalItemMovimentado != posicaoInicialItemMovimentado) {
                     
                    let itemMovimentado = todasTarefas.splice(posicaoInicialItemMovimentado, 1);  
  
                    todasTarefas.splice(posicaoFinalItemMovimentado, 0, itemMovimentado[0]);
          
                    atualizacaoTodasTarefas();

                }
            }

            atualizaLocalStorage(); 

            deletar();

            editar();

            dragAndDrop(); 
        } 

        dropAcionadoTodasTarefas = true;

    });
 
};
  
  


/* ====================================================== */
/* =================== CALCULA HORÁRIOS ================= */
/* ====================================================== */


function calculaHorarios (index) {  
        
    index === 0 ? inicioTarefa = horarioInicial : inicioTarefa = tarefasHoje[index-1].final;
  
    let inicioTarefaTotal = inicioTarefa.split(":");
    let inicioTarefaHoras = Number(inicioTarefaTotal[0]);
    let inicioTarefaMinutos = Number(inicioTarefaTotal[1]);

    let duracaoTotal = tarefasHoje[index].duracao.split(":");  
 
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
/* ================== ATUALIZA HORÁRIOS ================= */
/* ====================================================== */

function atualizaHorarios () {
  
    for (let i = 0; i < tarefasHoje.length; i++) {
          
        calculaHorarios (i);
        
        tarefasHoje[i].posicao = i; 
        tarefasHoje[i].inicio = inicioTarefa;
        tarefasHoje[i].final = finalTarefa;
          
        document.querySelectorAll(".tarefas-hoje-item")[i].id = `tarefas-hoje-item-${i}`;
 
        let novoTexto = `
            <span class="espacamento">${tarefasHoje[i].inicio}</span>
            <span class="espacamento tarefas-hoje-nome">${tarefasHoje[i].nome}</span>
            <span class="espacamento">${duracaoString}</span>
            <img class="tarefas-hoje-editar" id="tarefas-hoje-editar-${i}" src="images/editar_transparente.png">  
            <img class="tarefas-hoje-lixeiras" id="tarefas-hoje-lixeira-${i}" src="images/delete_transparente.png">
        `;

        document.getElementById(`tarefas-hoje-item-${i}`).innerHTML = novoTexto;
 
    }
 
    atualizaLocalStorage(); 
}
 
   
    
/* ====================================================== */
/* ======================= DELETAR ====================== */
/* ====================================================== */


function deletar() {  

    /* ======================= TODAS AS TAREFAS ====================== */
    
    document.querySelectorAll(".todas-tarefas-lixeiras").forEach((lixeira, index) => {
        if (document.getElementById(`todas-tarefas-lixeira-${index}`)) {
            document.getElementById(`todas-tarefas-lixeira-${index}`).src = "images/delete_transparente.png";
        } 
    });
 
    document.querySelectorAll(".todas-tarefas-item").forEach(tarefa => { 
  
        tarefa.addEventListener('mouseenter', function(event) {
            if (document.getElementById(`todas-tarefas-lixeira-${event.target.id.split("-")[3]}`)) {
                document.getElementById(`todas-tarefas-lixeira-${event.target.id.split("-")[3]}`).src = "images/delete.png";
            } 
        });

        tarefa.addEventListener('mouseleave', function(event) {
            if (document.getElementById(`todas-tarefas-lixeira-${event.target.id.split("-")[3]}`)) {
                document.getElementById(`todas-tarefas-lixeira-${event.target.id.split("-")[3]}`).src = "images/delete_transparente.png";
            }  
        });
    });
 
    document.querySelectorAll(".todas-tarefas-lixeiras").forEach(lixeira => {  
        if (!lixeira.classList.contains("click1")) {
            lixeira.addEventListener("click", lixeiraClick); 
            lixeira.classList.add("click1");
        }
    });
 
    function lixeiraClick (event) {
      
        document.getElementById(`todas-tarefas-item-${event.target.id.split("-")[3]}`).remove();               
        todasTarefas.splice(event.target.id.split("-")[3], 1);     
  
        for (let i = 0; i < document.querySelectorAll(".todas-tarefas-lixeiras").length; i++) {        
            document.querySelectorAll(".todas-tarefas-lixeiras")[i].id = `todas-tarefas-lixeira-${i}`;
        }

        for (let i = 0; i < document.querySelectorAll(".todas-tarefas-item").length; i++) {        
            document.querySelectorAll(".todas-tarefas-item")[i].id = `todas-tarefas-item-${i}`;
        }
  
        for (let i = 0; i < todasTarefas.length; i++) {  
            todasTarefas[i].posicao = i; 
        };
  
        for (let i = 0; i < document.querySelectorAll(".todas-tarefas-editar").length; i++) {        
            document.querySelectorAll(".todas-tarefas-editar")[i].id = `todas-tarefas-editar-${i}`;
        }

        document.querySelectorAll(".todas-tarefas-lixeiras").forEach(lixeira => {  
            if (lixeira.classList.contains("click1")) { 
                lixeira.removeEventListener('click', lixeiraClick);
                lixeira.classList.remove("click1"); 
                idNovaTarefa = 0;
            }
        });

        atualizaLocalStorage();  
        editar();
        deletar();
    }


    /* ======================= TAREFAS DE HOJE ====================== */ 

    document.querySelectorAll(".tarefas-hoje-lixeiras").forEach((lixeira, index) => {
        document.getElementById(`tarefas-hoje-lixeira-${index}`).src = "images/delete_transparente.png"; 
    });

    document.querySelectorAll(".tarefas-hoje-item").forEach(tarefa => { 
  
        tarefa.addEventListener('mouseenter', function(event) {
            if (document.getElementById(`tarefas-hoje-lixeira-${event.target.id.split("-")[3]}`)) {
                document.getElementById(`tarefas-hoje-lixeira-${event.target.id.split("-")[3]}`).src = "images/delete.png"; 
            }
        });

        tarefa.addEventListener('mouseleave', function(event) {
            if (document.getElementById(`tarefas-hoje-lixeira-${event.target.id.split("-")[3]}`)) {
                document.getElementById(`tarefas-hoje-lixeira-${event.target.id.split("-")[3]}`).src = "images/delete_transparente.png"; 
            }
        });
    });
 
    document.querySelectorAll(".tarefas-hoje-lixeiras").forEach(lixeira => {  
        if (!lixeira.classList.contains("click2")) {
            lixeira.addEventListener('click', lixeiraClick2); 
            lixeira.classList.add("click2");
        }
    });
 
    function lixeiraClick2 (event) {
     
        document.getElementById(`tarefas-hoje-item-${event.target.id.split("-")[3]}`).remove();               
        tarefasHoje.splice(event.target.id.split("-")[3], 1);   
 
        for (let i = 0; i < document.querySelectorAll(".tarefas-hoje-lixeiras").length; i++) {        
            document.querySelectorAll(".tarefas-hoje-lixeiras")[i].id = `tarefas-hoje-lixeira-${i}`;
        }

        for (let i = 0; i < document.querySelectorAll(".tarefas-hoje-item").length; i++) {        
            document.querySelectorAll(".tarefas-hoje-item")[i].id = `tarefas-hoje-item-${i}`;
        }
  
        for (let i = 0; i < tarefasHoje.length; i++) {  
            tarefasHoje[i].posicao = i; 
        };
 

        document.querySelectorAll(".tarefas-hoje-lixeiras").forEach(lixeira => {  
            if (lixeira.classList.contains("click2")) { 
                lixeira.removeEventListener('click', lixeiraClick2);
                lixeira.classList.remove("click2"); 
            }
        });
  
        if (document.querySelector(".tarefa-atual")) {
            document.querySelector(".tarefa-atual").classList.remove("tarefa-atual");
        }

        atualizaHorarios ();
        editar();
        deletar();
    }
  
} 

 

/* ====================================================== */
/* ======================== EDITAR ====================== */
/* ====================================================== */


function editar() {  

    /* ======================= TODAS AS TAREFAS ====================== */
    
    document.querySelectorAll(".todas-tarefas-editar").forEach((lapis, index) => {

        if (document.getElementById(`todas-tarefas-editar-${index}`)) {
            document.getElementById(`todas-tarefas-editar-${index}`).src = "images/editar_transparente.png"; 
        } 
    });
 

    document.querySelectorAll(".todas-tarefas-item").forEach(tarefa => { 
  
        tarefa.addEventListener('mouseenter', function(event) {

            if (document.getElementById(`todas-tarefas-editar-${event.target.id.split("-")[3]}`)) {
                document.getElementById(`todas-tarefas-editar-${event.target.id.split("-")[3]}`).src = "images/editar.png"; 
            } 
        });


        tarefa.addEventListener('mouseleave', function(event) {

            if (document.getElementById(`todas-tarefas-editar-${event.target.id.split("-")[3]}`)) {
                document.getElementById(`todas-tarefas-editar-${event.target.id.split("-")[3]}`).src = "images/editar_transparente.png"; 
            }
        });
    });
 

    document.querySelectorAll(".todas-tarefas-editar").forEach(lapis => {   
        lapis.addEventListener("click", editarTodasTarefas);   
    });
 

    function editarTodasTarefas (event) {
       
        document.querySelectorAll(".todas-tarefas-lixeiras").forEach(lixeira => {  
            lixeira.style.opacity = "0";
            lixeira.style.pointerEvents = "none";
        });

        
        document.querySelectorAll(".todas-tarefas-editar").forEach(lapis => {  
            lapis.style.opacity = "0";
            lapis.style.pointerEvents = "none";
        });

        document.querySelectorAll(".tarefas-arrastaveis").forEach(tarefa => {
            tarefa.setAttribute("draggable", false);
            tarefa.style.cursor = "default";
        });



        let tarefaEditada = 
            `
            <input type="text" id="todas-tarefas-novo-nome" value="${todasTarefas[event.target.id.split("-")[3]].nome}" autocomplete="off">
            <input type="time" id="todas-tarefas-nova-duracao" value="${todasTarefas[event.target.id.split("-")[3]].duracao}">
            <img class="todas-tarefas-close" id="todas-tarefas-close-${event.target.id.split("-")[3]}" src="images/close.png" alt="close">
            <img class="todas-tarefas-salvar" id="todas-tarefas-salvar-${event.target.id.split("-")[3]}" src="images/salvar.png" alt="salvar">
            ` ;

        document.getElementById(`todas-tarefas-item-${event.target.id.split("-")[3]}`).innerHTML = tarefaEditada;
       
        document.getElementById(`todas-tarefas-salvar-${event.target.id.split("-")[3]}`).addEventListener("click", function () { 
            
            if (document.getElementById("todas-tarefas-novo-nome").value !== "" && document.getElementById("todas-tarefas-novo-nome").value !== " ") { 
                todasTarefas[event.target.id.split("-")[3]].nome = document.getElementById("todas-tarefas-novo-nome").value; 
            }

            if (document.getElementById("todas-tarefas-nova-duracao").value !== "" && document.getElementById("todas-tarefas-nova-duracao").value !== " ") { 
                todasTarefas[event.target.id.split("-")[3]].duracao = document.getElementById("todas-tarefas-nova-duracao").value;
            }        
 
            atualizacaoTarefasHoje(); 
            atualizacaoTodasTarefas(); 
            deletar();
            editar();
            atualizaLocalStorage(); 
        }); 

        
        document.getElementById(`todas-tarefas-close-${event.target.id.split("-")[3]}`).addEventListener("click", function () {  
            
            atualizacaoTarefasHoje(); 
            atualizacaoTodasTarefas(); 
            deletar();
            editar();
            atualizaLocalStorage(); 
        }); 
 
    }


    /* ======================= TAREFAS DE HOJE ====================== */ 

    document.querySelectorAll(".tarefas-hoje-editar").forEach((lapis, index) => {

        if (document.getElementById(`tarefas-hoje-editar-${index}`)) {
            document.getElementById(`tarefas-hoje-editar-${index}`).src = "images/editar_transparente.png"; 
        } 
    });
 

    document.querySelectorAll(".tarefas-hoje-item").forEach(tarefa => { 
  
        tarefa.addEventListener('mouseenter', function(event) {

            if (document.getElementById(`tarefas-hoje-editar-${event.target.id.split("-")[3]}`)) {
                document.getElementById(`tarefas-hoje-editar-${event.target.id.split("-")[3]}`).src = "images/editar.png"; 
            } 
        });


        tarefa.addEventListener('mouseleave', function(event) {

            if (document.getElementById(`tarefas-hoje-editar-${event.target.id.split("-")[3]}`)) {
                document.getElementById(`tarefas-hoje-editar-${event.target.id.split("-")[3]}`).src = "images/editar_transparente.png"; 
            }
        });
    });
 

    document.querySelectorAll(".tarefas-hoje-editar").forEach(lapis => {   
        lapis.addEventListener("click", editarTarefasHoje);   
    });
 

    function editarTarefasHoje (event) {
       
        document.querySelectorAll(".tarefas-hoje-lixeiras").forEach(lixeira => {  
            lixeira.style.opacity = "0";
            lixeira.style.pointerEvents = "none";
        });

        
        document.querySelectorAll(".tarefas-hoje-editar").forEach(lapis => {  
            lapis.style.opacity = "0";
            lapis.style.pointerEvents = "none";
        });

        document.querySelectorAll(".tarefas-arrastaveis").forEach(tarefa => {
            tarefa.setAttribute("draggable", false);
            tarefa.style.cursor = "default";
        });
  
        let tarefaEditada = 
            `
            <span id="espacamento-tempo"></span>
            <input type="text" id="tarefas-hoje-novo-nome" value="${tarefasHoje[event.target.id.split("-")[3]].nome}" autocomplete="off">
            <input type="time" id="tarefas-hoje-nova-duracao" value="${tarefasHoje[event.target.id.split("-")[3]].duracao}">
            <img class="tarefas-hoje-close" id="tarefas-hoje-close-${event.target.id.split("-")[3]}" src="images/close.png" alt="close">
            <img class="tarefas-hoje-salvar" id="tarefas-hoje-salvar-${event.target.id.split("-")[3]}" src="images/salvar.png" alt="salvar">
            ` ;

        document.getElementById(`tarefas-hoje-item-${event.target.id.split("-")[3]}`).innerHTML = tarefaEditada;
     

        document.getElementById(`tarefas-hoje-salvar-${event.target.id.split("-")[3]}`).addEventListener("click", function () { 
            
            if (document.getElementById("tarefas-hoje-novo-nome").value !== "" && document.getElementById("tarefas-hoje-novo-nome").value !== " ") { 
                tarefasHoje[event.target.id.split("-")[3]].nome = document.getElementById("tarefas-hoje-novo-nome").value; 
            }

            if (document.getElementById("tarefas-hoje-nova-duracao").value !== "" && document.getElementById("tarefas-hoje-nova-duracao").value !== " ") { 
                tarefasHoje[event.target.id.split("-")[3]].duracao = document.getElementById("tarefas-hoje-nova-duracao").value;
            }        
 
            atualizacaoTarefasHoje(); 
            atualizacaoTodasTarefas(); 
            deletar();
            editar();
            atualizaLocalStorage(); 
        }); 

        
        document.getElementById(`tarefas-hoje-close-${event.target.id.split("-")[3]}`).addEventListener("click", function () {  
            atualizacaoTarefasHoje(); 
            atualizacaoTodasTarefas(); 
            deletar();
            editar();
            atualizaLocalStorage(); 
        }); 
 
    }
 
} 

 
 

/* ====================================================== */
/* ===================== LOCAL STORAGE ================== */
/* ====================================================== */
 

function atualizaLocalStorage () {
          
    window.localStorage.clear();
    window.localStorage.setItem('todasTarefasLS', JSON.stringify(todasTarefas));
    window.localStorage.setItem('tarefasHojeLS', JSON.stringify(tarefasHoje));
    window.localStorage.setItem('horarioInicial', JSON.stringify(horarioInicial)); 

}

 
function downloadLocalStorage() {
 
    if (localStorage.getItem("horarioInicial") != undefined) {   
        document.getElementById("horario-inicial").value = JSON.parse(localStorage.getItem("horarioInicial"));
    }

    if (localStorage.getItem("volumeAlarme") != undefined) {   
        document.getElementById("volume-alarme").value = JSON.parse(localStorage.getItem("volumeAlarme"));
    }

    if (document.querySelector(".tarefas-hoje-container").childNodes.length === 3 && localStorage.getItem("tarefasHojeLS")) {  

        let tarefasHojeLS = JSON.parse(localStorage.getItem("tarefasHojeLS"));
        horarioInicial = JSON.parse(localStorage.getItem("horarioInicial"));
  
        for (let i = 0; i < tarefasHojeLS.length; i++) { 

            tarefasHoje[i] = tarefasHojeLS[i]; 

            let duracaoHoras = Number(tarefasHoje[i].duracao.split(":")[0]);
            let duracaoMinutos = Number(tarefasHoje[i].duracao.split(":")[1]);

            formatacaoDuracao(duracaoHoras, duracaoMinutos);
 
            let textoTarefa = `
                <span class="espacamento">${tarefasHoje[i].inicio}</span>
                <span class="espacamento tarefas-hoje-nome">${tarefasHoje[i].nome}</span>
                <span class="espacamento">${duracaoString}</span> 
                <img class="tarefas-hoje-editar" id="tarefas-hoje-editar-${i}" src="images/editar_transparente.png">  
                <img class="tarefas-hoje-lixeiras" id="tarefas-hoje-lixeira-${i}" src="images/delete_transparente.png">
            `;


            let p = document.createElement('p');
            p.classList.add("tarefas-arrastaveis");
            p.classList.add("tarefas-hoje-item");
            p.draggable = true;
            p.id = `tarefas-hoje-item-${i}`;
            p.innerHTML = textoTarefa;

            document.querySelector(".tarefas-hoje-container").appendChild(p);
 
        }  
 
    } 
 

    if (document.querySelector(".todas-tarefas-container").childNodes.length === 3 && localStorage.getItem("todasTarefasLS")) { 
         
        let todasTarefasLS = JSON.parse(localStorage.getItem("todasTarefasLS"));
        horarioInicial = JSON.parse(localStorage.getItem("horarioInicial"));
          
        for (let i = 0; i < todasTarefasLS.length; i++) {

            todasTarefas[i] = todasTarefasLS[i]; 
  
            formatacaoDuracao(Number(todasTarefas[i].duracao.split(":")[0]), Number(todasTarefas[i].duracao.split(":")[1])); 
 
            let textoTarefa = ` 
                <span id="todas-tarefas-nome-${i}">${todasTarefas[i].nome}</span>
                <span id="todas-tarefas-duracao-${i}">${duracaoString}</span>  
                <img class="todas-tarefas-editar" id="todas-tarefas-editar-${i}" src="images/editar_transparente.png">  
                <img class="todas-tarefas-lixeiras" id="todas-tarefas-lixeira-${i}" src="images/delete_transparente.png">     
            `; 
    
            let p = document.createElement('p'); 
            p.classList.add("tarefas-arrastaveis");
            p.classList.add("todas-tarefas-item");
            p.draggable = true;
            p.id = `todas-tarefas-item-${i}`;
            p.innerHTML = textoTarefa;
    
            document.querySelector(".todas-tarefas-container").appendChild(p);
        }
  
    } 
  
}



/* ====================================================== */
/* ====================== TAREFA ATUAL ================== */
/* ====================================================== */
 
let volumeAlarme;

function tarefaAtual() {

    let alarmeTocou = false;
    let indexTarefaAtual = -1;
    setInterval(hora, 1000); 

    function hora () {  
   
        volumeAlarme = Number(document.getElementById("volume-alarme").value);
        window.localStorage.setItem('volumeAlarme', JSON.stringify(volumeAlarme));

        tarefasHoje.forEach((tarefa, index) => {
  
            let horaInicioTarefa = tarefa.inicio.split(":")[0];
            let minutoInicioTarefa = tarefa.inicio.split(":")[1];
            let horaFinalTarefa = tarefa.final.split(":")[0];
            let minutoFinalTarefa = tarefa.final.split(":")[1];
 
            let horaAtual = new Date().toLocaleTimeString(navigator.language, {hourCycle: 'h23', hour: "numeric", minute: "numeric"});        
            let hora = horaAtual.split(":")[0];
            let minutos = horaAtual.split(":")[1]; 
         
            let horarioAtual = Date.UTC(2022, 10, 15, hora, minutos);
            let começoTarefa = Date.UTC(2022, 10, 15, horaInicioTarefa, minutoInicioTarefa);
            let fimTarefa = Date.UTC(2022, 10, 15, horaFinalTarefa, minutoFinalTarefa);
 

            if (horarioAtual >= começoTarefa && horarioAtual < fimTarefa) {

                document.getElementById(`tarefas-hoje-item-${index}`).classList.add("tarefa-atual");
 
                indexTarefaAtual = index;

                if (alarmeTocou === false) {
                    
                    let alarme = new Audio("sounds/alarme.mp3");
                    volumeAlarme = Number(document.getElementById("volume-alarme").value);
                    alarme.volume = volumeAlarme; 
                    alarme.play(); 
                    
                    alarmeTocou = true;    
                    deletar();    
                    editar();                
                } 
            }

            if (horarioAtual == fimTarefa && index === indexTarefaAtual) {

                if (document.querySelector(".tarefa-atual")) {
                    document.querySelector(".tarefa-atual").classList.remove("tarefa-atual"); 
                    alarmeTocou = false; 
                }
            } 
        
        }); 
    }  
} 
