// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  // baseUrl: 'http://localhost:5000/api',
  // mediaUrl: 'http://localhost:5000/api/uploads',
  // soketServer : 'http://localhost:5000',
  // nombreSelected: 'pizzeria',

  //remoto vercel
  baseUrl: 'https://back-zlipmenu.onrender.com/api',
  mediaUrl: 'https://back-zlipmenu.onrender.com/api/uploads',
  soketServer: 'https://back-zlipmenu.onrender.com',
  nombreSelected: 'zlipmenu-generic',
  
  mediaUrlRemoto: 'https://res.cloudinary.com/dmv6aukai/image/upload/v1741218430/zlipmenu',
  urlBackedNotification:'https://back-zlipmenu.onrender.com/api/notipush/save-subscription',
  VAPI_KEY_PUBLIC: 'BGlxB4IqUGZq7BoOU1KLM0Yb4Olh7_zI0xfpvOIOYvQMZhjsrFgs5_ofdZpvMa7ohTQUCk0qLrOcW06U4XCajcw',
  
  client_idGoogle: '291137676127-svvuuca518djs47q2v78se9q6iggi4nq.apps.googleusercontent.com',
  //pluggins
  rapidapiKey: 'a7036a3222mshc2920e679cd1cafp141e56jsn81cbe707ac15',
  rapidapiHost: 'apidojo-17track-v1.p.rapidapi.com',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
