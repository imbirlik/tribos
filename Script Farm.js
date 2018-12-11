// ==UserScript==
// @name Farm 63 ciclo
// @description Farmar
// @author Gamer28
// @include        https://*screen=am_farm*
// @require http://momentjs.com/downloads/moment.js
// @version 2.6
// ==/UserScript==

var aldeiasComModeloA = [
];

//distanciamax é a distancia da aldeia do jogador à aldeia bárbara maxima que queremos que farm
var distanciamax = 40;
//atacar aldeias que só foram espiadas?
// "= true" para atacar, "= false" para ignorar aldeias espiadas
var ataqueBatedores = true;
//Aldeias que são tuas mas não queres que elas farmem
//se a restricaoHora estiver ativa, estas aldeias passam a farmar desde que as leves estejam em casa à hora colocada
var ignorarAldeias = [
    "634|469",
    "628|452",
    "635|456",
    "636|447",
];
//Farmar com o modelo B ou com o modelo A?
var modelo = "B";


//restricao de horas ativa?
var restricaoHora = false;
//Data que as leves teem de estar em casa, exemplo
//Date(2018,12,1,12,0,0,0);
//2018/12/10 ao 12:00:00:00
var data = new Date(2018,11,12,12,0,0,0);

/*------------------------------------------------------------------------------------------------------------------------------*/
/*A PARTIR DAQUI NÃO MEXER*/
var tempo = 500;
var x = 0;
var aleat;
var auxTabela = 2;
var menu;
var coordAldeia = $('b.nowrap').text();
var auxContains = false;
var ataquePossiveis;
var leves = $("#units_home #light").text();
var levesModelo;
var value = $("[name='light']")[0].value;
var d = new Date(); //data atual
var coordenadasAldeiaMae = splitCoordenadas(coordAldeia);

console.log("Data Atual: " + d);
console.log("Data introduzida: " + data);

aldeiasComModeloA.forEach(function(coord){
    if(coordAldeia.includes(coord))
    {
        modelo = "A";
        console.log("Usando modelo A para esta aldeia");
    }
});

if(modelo == "A")
{
    menu = $('#am_widget_Farm a.farm_icon_a');
    levesModelo = $("[name='light']")[0].value;
}
else if(modelo == "B"){
    menu = $('#am_widget_Farm a.farm_icon_b');
    levesModelo = $("[name='light']")[1].value;
}

ignorarAldeias.forEach(function (coord){
    if(coordAldeia.includes(coord))
        auxContains = true;
});

var jaEnviados = $(menu).parent().parent().find('img.tooltip').length+"000";
console.log("Ja existe " + jaEnviados.substring(0,(jaEnviados.length - 3)) + " aldeia com ataque.");

var altAldTempo = parseInt($('#am_widget_Farm a.farm_icon_c').length+"000") - parseInt(jaEnviados);
console.log("Resta " + altAldTempo + " aldeias para Atacar.");

if (altAldTempo == "0") {
altAldTempo = aleatorio(14000,19000);
} else {
altAldTempo = parseInt(altAldTempo) + parseInt(aleatorio(4000,14000));
}
console.log("Resta " + altAldTempo + " milesegundos para alternar a aldeia.");

function aleatorio(inferior, superior) {
    var numPosibilidades = superior - inferior;
    aleat = Math.random() * numPosibilidades;
    return Math.round(parseInt(inferior) + aleat);
}

ataquePossiveis = Math.round(leves/levesModelo);
console.log("Ataques possiveis: " + leves + " / " + levesModelo + " = " + ataquePossiveis);

if(restricaoHora == false){
    normalFarm();
}
else if(restricaoHora){
    restricaoFarm();
}
else
    console.log("Something went wrong....");

function restricaoFarm(){
    console.log("Modo de Farm: Restricao");
    for (var i = 0; i < ataquePossiveis; i++) {
        $(menu).eq(i).each(function() {
            var tempoAgora = (tempo * ++x) - aleatorio(150,300);
            setTimeout(function(minhaVar) {
                var bolasrc = $('#am_widget_Farm').find('table tr').eq(auxTabela).find('td > img')[0].src;
                var distanciaTabela = $('#am_widget_Farm').find('table tr').eq(auxTabela).find('td:eq(7)').text();
                var coordenadasBB = splitCoordenadas($('#am_widget_Farm').find('table tr').eq(auxTabela).find('td:eq(3)').text());

                var enviar = calcularTempo(coordenadasBB, coordenadasAldeiaMae);
                auxTabela++;

                if(ataqueBatedores && distanciaTabela < distanciamax && enviar){
                    $(minhaVar).click();
                }
                else{
                    if(!ataqueBatedores && enviar){
                        if(bolasrc.includes('blue.png')){
                            console.log("Aldeia com batedores: ignorar");
                        }
                        else{
                            if(distanciaTabela < distanciamax && enviar)
                                $(minhaVar).click();
                            else
                                console.log("Aldeia ignorada devido à distância");
                        }
                    }
                }
            }, tempoAgora, this);
        });
    }
}

function normalFarm(){
    console.log("Modo de Farm: Normal");
    if(!auxContains){
        for (var i = 0; i < ataquePossiveis; i++) {
            $(menu).eq(i).each(function() {
                var tempoAgora = (tempo * ++x) - aleatorio(150,300);
                setTimeout(function(minhaVar) {
                    var bolasrc = $('#am_widget_Farm').find('table tr').eq(auxTabela).find('td > img')[0].src;
                    var distanciaTabela = $('#am_widget_Farm').find('table tr').eq(auxTabela).find('td:eq(7)').text();
                    auxTabela++;

                    if(ataqueBatedores && distanciaTabela < distanciamax){
                        $(minhaVar).click();
                    }
                    else{
                        if(!ataqueBatedores){
                            if(bolasrc.includes('blue.png')){
                                console.log("Aldeia com batedores: ignorar");
                            }
                            else{
                                if(distanciaTabela < distanciamax)
                                    $(minhaVar).click();
                                else
                                    console.log("Aldeia ignorada devido à distância");
                            }
                        }
                    }
                }, tempoAgora, this);
            });
        }
    }
    else
        console.log("A aldeia foi ignorada pois está presente no array de aldeias que o script deve ignorar!");
}


function splitCoordenadas(str){
    var strSplited = str.split('|');
    var splitOfSplit = strSplited[1].split(' ');
    var coordenadas = [
        splitOfSplit[0].split(')').join(''),
        strSplited[0].split('(').join('')
    ]

    return coordenadas;
}

function calcularTempo(aldeiaBB, aldeiaBase){

    var triangulo = [];

    for(var i=0; i<aldeiaBase.length; i++){
        aldeiaBase[i] = +aldeiaBase[i];
        aldeiaBB[i] = +aldeiaBB[i];
    }

    for(i=0; i<aldeiaBase.length; i++){
        triangulo[i] = Math.abs((aldeiaBase[i]-aldeiaBB[i]));
    }

    var distancia = Math.sqrt((triangulo[0]*triangulo[0])+(triangulo[1]*triangulo[1]));
    var tempoSegundos = distancia * (10*60);

    var newDateObj = moment(d).add((tempoSegundos*2), 's').toDate();
    console.log(newDateObj);

    if(newDateObj < data)
        return true;
    else
        return false;
}

function altAldeia()
{
    $('.arrowRight').click();
    $('.groupRight').click();
}
setInterval(altAldeia, altAldTempo);