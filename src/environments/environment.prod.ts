export const environment = {
  production: false,
  // baseUrl: 'http://localhost:3003/api',
  // mediaUrl: 'http://localhost:3003/api/uploads/',
  // soketServer : 'http://localhost:3003',
  //remoto vercel

 baseUrl: 'https://back-zlipmenu.onrender.com/api',
  mediaUrl: 'https://back-zlipmenu.onrender.com/api/uploads',
  soketServer: 'https://back-zlipmenu.onrender.com',
  mediaUrlRemoto: 'https://res.cloudinary.com/dmv6aukai/image/upload/v1741218430/zlipmenu',
  // En lugar de texto fijo, lee lo que inyecta Vercel al compilar
  //configurar el nombre directamente en el servidor vercel 
  nombreSelected: 'zlipmenu-generic',
  
  urlBackedNotification:'https://back-zlipmenu.onrender.com/api/notipush/save-subscription',
  VAPI_KEY_PUBLIC: 'BGlxB4IqUGZq7BoOU1KLM0Yb4Olh7_zI0xfpvOIOYvQMZhjsrFgs5_ofdZpvMa7ohTQUCk0qLrOcW06U4XCajcw',
  
  //pluggins
  rapidapiKey: 'a7036a3222mshc2920e679cd1cafp141e56jsn81cbe707ac15',
  rapidapiHost: 'apidojo-17track-v1.p.rapidapi.com',

  client_idGoogle: '291137676127-svvuuca518djs47q2v78se9q6iggi4nq.apps.googleusercontent.com'
};
