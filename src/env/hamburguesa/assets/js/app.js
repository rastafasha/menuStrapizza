var url = window.location.href;
// var swLocation = '/sw.js';

if (navigator.serviceWorker) {
    navigator.serviceWorker.register('./sw.js');
}


// if (navigator.serviceWorker) {
//     if (url.includes('localhost')) {
//         swLocation = '/sw.js'
//     }
//     navigator.serviceWorker.register(swLocation);
// }



// Detectar cambios de conexión
function isOnline() {

    if (navigator.onLine) {
        // tenemos conexión
        // console.log('online');
        $.mdtoast('Online', {
            interaction: true,
            interactionTimeout: 1000,
            actionText: 'OK!'
        });


    } else {
        // No tenemos conexión
        $.mdtoast('Offline', {
            interaction: true,
            actionText: 'OK',
            type: 'warning'
        });
    }

}

window.addEventListener('online', isOnline);
window.addEventListener('offline', isOnline);

isOnline();



///



// Notificaciones
// function verificaSuscripcion(activadas) {

//     if (activadas) {

//         btnActivadas.removeClass('oculto');
//         btnDesactivadas.addClass('oculto');

//     } else {
//         btnActivadas.addClass('oculto');
//         btnDesactivadas.removeClass('oculto');
//     }

// }



function enviarNotificacion() {

    const notificationOpts = {
        body: 'Este es el cuerpo de la notificación',
        icon: 'img/icons/icon-72x72.png'
    };


    const n = new Notification('Hola Mundo', notificationOpts);

    n.onclick = () => {
        console.log('Click');
    };

}


function notificarme() {

    if (!window.Notification) {
        console.log('Este navegador no soporta notificaciones');
        return;
    }

    if (Notification.permission === 'granted') {

        // new Notification('Hola Mundo! - granted');
        enviarNotificacion();

    } else if (Notification.permission !== 'denied' || Notification.permission === 'default') {

        Notification.requestPermission(function(permission) {

            console.log(permission);

            if (permission === 'granted') {
                // new Notification('Hola Mundo! - pregunta');
                enviarNotificacion();
            }

        });

    }



}

// notificarme();


// Get Key
function getPublicKey() {

    // fetch('api/key')
    //     .then( res => res.text())
    //     .then( console.log );

    return fetch('api/key')
        .then(res => res.arrayBuffer())
        // returnar arreglo, pero como un Uint8array
        .then(key => new Uint8Array(key));


}

// getPublicKey().then( console.log );
// btnDesactivadas.on('click', function() {

//     if (!swReg) return console.log('No hay registro de SW');

//     getPublicKey().then(function(key) {

//         swReg.pushManager.subscribe({
//                 userVisibleOnly: true,
//                 applicationServerKey: key
//             })
//             .then(res => res.toJSON())
//             .then(suscripcion => {

//                 // console.log(suscripcion);
//                 fetch('api/subscribe', {
//                         method: 'POST',
//                         headers: { 'Content-Type': 'application/json' },
//                         body: JSON.stringify(suscripcion)
//                     })
//                     .then(verificaSuscripcion)
//                     .catch(cancelarSuscripcion);


//             });


//     });


// });



function cancelarSuscripcion() {

    swReg.pushManager.getSubscription().then(subs => {

        subs.unsubscribe().then(() => verificaSuscripcion(false));

    });


}

// btnActivadas.on('click', function() {

//     cancelarSuscripcion();


// });