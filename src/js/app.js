let paso = 1;
const pasoInicial = 1;
const pasoFinal = 3;

const cita = {

    id: '',
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []

}

document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});

function iniciarApp() {
    mostrarSeccion();
    tabs(); // Cambia la sección cuando se presionen los tabs
    botonesPaginador(); // Agrega o quita los botones de la pagina
    paginaSiguiente();
    paginaAnterior();

    consultarAPI();
    idCliente();

    nombreCliente();
    seleccionarFecha();
    seleccionarHora();
    mostrarResumen();
}

function mostrarSeccion() {
    // Ocultar la seccion que tenga la clase de mostrar
    const seccionAnterior = document.querySelector('.mostrar');
    if (seccionAnterior) {
        seccionAnterior.classList.remove('mostrar');
    }

    // Seleccionar la seccion con el paso...
    const pasoSelector = `#paso-${paso}`;
    const seccion = document.querySelector(pasoSelector);
    seccion.classList.add('mostrar');

    // Quita la clase actual al tab anterior
    const tabAnterior = document.querySelector('.actual');
    if (tabAnterior) {
        tabAnterior.classList.remove('actual');
    }

    // Resalta el tab actual
    const tab = document.querySelector(`[data-paso="${paso}"]`);
    tab.classList.add('actual');
}

function tabs() {
    const botones = document.querySelectorAll('.tabs button');

    botones.forEach(boton => {
        boton.addEventListener('click', function(e) {
            paso = parseInt(e.target.dataset.paso);
            mostrarSeccion();
            botonesPaginador();

           
        });
    });
}

function botonesPaginador() {
    const paginaAnterior = document.querySelector('#anterior');
    const paginaSiguiente = document.querySelector('#siguiente');

    if (paso === 1) {
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    } else if (paso === 3) {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.add('ocultar'); // Oculta el botón siguiente en el paso 3
    } else {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');

        mostrarResumen();
    }
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', function() {
        if (paso <= pasoInicial) return;
        paso--;
        mostrarSeccion(); // Mostrar la sección actualizada
        botonesPaginador();
    });
}

function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', function() {
        if (paso >= pasoFinal) return;
        paso++;
        mostrarSeccion(); // Mostrar la sección actualizada
        botonesPaginador();
    });
}

async function consultarAPI(){

    try{

        const url = '/api/servicios';
        const resultado = await fetch(url);
        const servicios= await resultado.json();
        mostrarServicios(servicios);

       

       

    } catch (error){

        console.log(error);
        
    }

}

function mostrarServicios(servicios){
    servicios.forEach( servicio =>{
        const { id, nombre, precio} = servicio;

        const nombreServicio = document.createElement('P');
        nombreServicio.classList.add('nombre-servicio');
        nombreServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.classList.add('precio-servicio');
        precioServicio.textContent = `€${precio}`;

        const servicioDiv = document.createElement('DIV');
        servicioDiv.classList.add('servicio');
        servicioDiv.dataset.idServicio = id;
        servicioDiv.onclick = function(){
            seleccionarServicio(servicio);
        }

        servicioDiv.appendChild(nombreServicio);
        servicioDiv.appendChild(precioServicio);

        document.querySelector('#servicios').appendChild(servicioDiv);

    })

}

function seleccionarServicio(servicio){

    const {id} = servicio;

   const { servicios } = cita;

   const divServicio = document.querySelector(`[data-id-servicio="${id}"]`);

   //Comprobar si un servicio ya fue agregado
    if( servicios.some( agregado=> agregado.id === id )) {
        cita.servicios = servicios.filter( agregado => agregado.id !== id );
        divServicio.classList.remove('seleccionado');

    }else{

        cita.servicios = [...servicios, servicio];
        divServicio.classList.add('seleccionado');

    }


  

   
   

   console.log(cita);
}

function idCliente(){
    cita.id = document.querySelector('#id').value;
}

function nombreCliente(){

    cita.nombre = document.querySelector('#nombre').value;
    

}

function seleccionarFecha(){

    const inputFecha = document.querySelector('#fecha');
    inputFecha.addEventListener('input', function(e){

        const dia = new Date(e.target.value).getUTCDay();

        // Verificamos si el día seleccionado es Domingo (0)
        if(dia === 0) { 
            e.target.value = '';
            mostrarAlerta('Domingos no abrimos', 'error', '.formulario');
        } else {
            cita.fecha = e.target.value;
        }
        
    });
}

function mostrarAlerta(mensaje, tipo, elemento, desaparece = true) {
    // Previene que se genere más de 1 alerta
    const alertaPrevia = document.querySelector('.alerta');
    if (alertaPrevia){
        alertaPrevia.remove();

    }

    // Scripting para crear la alerta
    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');
    alerta.classList.add(tipo);

    const formulario = document.querySelector(elemento);
    formulario.appendChild(alerta);

    if (desaparece) {
        // Eliminar la alerta
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }
}

function seleccionarHora(){

    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', function(e){

        const horaCita = e.target.value;
        const hora = horaCita.split(":") [0];
        if(hora <10 || hora > 18) {
            e.target.value = '';
            mostrarAlerta('Hora no válida, abrimos de 10 AM a 18 PM' , 'error', '.formulario');
        }else{
            cita.hora = e.target.value;
            console.log(cita);
        }
    })
}

function mostrarResumen() {
    const resumen = document.querySelector('.contenido-resumen');
    //Limpiar el contenido de resumen
    while(resumen.firstChild){
        resumen.removeChild(resumen.firstChild);
    }


    // Corregimos el typo 'lenght' a 'length'
    if (Object.values(cita).includes('') || cita.servicios.length === 0 ) {
        mostrarAlerta('Faltan datos de Servicios, Fecha u Hora', 'error', '.contenido-resumen', false);

        return;
    } 

    // Formatear el div de resumen
    const { nombre, fecha, hora, servicios} = cita;


    //Heading para servicios en Resumen

    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de los Servicios';
    resumen.appendChild(headingServicios);


    servicios.forEach(servicio=>{
        const {id, precio, nombre} = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');
        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.innerHTML = `<span>Precio:</span> €${precio}`;


        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        resumen.appendChild(contenedorServicio);
    });

     //Heading para Citas en Resumen

     const headingCita = document.createElement('H3');
     headingCita.textContent = 'Resumen de la Cita';
     resumen.appendChild(headingCita);

    const nombreCliente = document.createElement('P');
    nombreCliente.innerHTML = `<span>Nombre:</span> ${nombre}`;

    const fechaObj = new Date(fecha);
const mes = fechaObj.getMonth();
const dia = fechaObj.getDate();
const year = fechaObj.getFullYear();

// Creación de la fecha UTC (si realmente necesitas UTC)
const fechaUTC = new Date(Date.UTC(year, mes , dia ));

// Opciones para formatear la fecha
const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

// Formatear la fecha usando las opciones
const fechaFormateada = fechaUTC.toLocaleDateString('es-ES', opciones);

// Crear el elemento para mostrar la fecha formateada
const fechaCita = document.createElement('P');
fechaCita.innerHTML = `<span>Fecha:</span> ${fechaFormateada}`;

// Crear el elemento para mostrar la hora
const horaCita = document.createElement('P');
horaCita.innerHTML = `<span>Hora:</span> ${hora} Horas`;

//Boton crear cita

const botonReservar = document.createElement('BUTTON');
botonReservar.classList.add('boton');
botonReservar.textContent = 'Reservar Cita';
botonReservar.onclick = reservarCita;


    resumen.appendChild(nombreCliente);
    resumen.appendChild(fechaCita);
    resumen.appendChild(horaCita);

    resumen.appendChild(botonReservar);

}

async function reservarCita(){

    const { nombre, fecha, hora, servicios, id } = cita;
    const idServicios = servicios.map( servicio => servicio.id);
    const datos = new FormData();

    
    datos.append('fecha', fecha);
    datos.append('hora', hora);
    datos.append('usuarioId', id);
    datos.append('servicios', idServicios);

   try {

    const url = `/api/citas`;
    const respuesta = await fetch (url,{
        method: 'POST',
        body: datos
    });

    const resultado = await respuesta.json();
    console.log(resultado.resultado);

    if (resultado.resultado) {
        Swal.fire({
            icon: "success",
            title: "Cita Confirmada",
            text: "¡Tu cita fue creada con éxito!",
            confirmButtonText: 'OK' // Propiedad corregida
        }).then(() => {
            setTimeout(() =>{
                window.location.reload();
            }, 3000);
            
        });
    }
    
   } catch (error) {

    Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al guardar la cita",
      
      });
    
   }

    //Peticion hacia la api

    
}