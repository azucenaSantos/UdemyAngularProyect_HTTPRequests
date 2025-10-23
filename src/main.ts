import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import {
  HttpEventType,
  HttpHandlerFn,
  HttpRequest,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { tap } from 'rxjs';

//Funcion que va a funcionar como un interceptor
function logginInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  console.log('[Outloging Request]');
  console.log(request);
  //usamos el pipe porque si aqui hacemos un suscribe, en las demás partes de la app que
  //se hagan peticiones no se podrán hacer porque el suscribe ya tuvo lugar en el interceptor
  //usamos el pipe para modificar lo que sea necesario de la request
  return next(request).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) { //en este caso solo comprobamos si es una respuesta
          //y mostramos unos console.log
          console.log('Incoming Response');
          console.log(event.status);
          console.log(event.body);
        }
      },
    })
  );

  //en esta funcion se podrian cambiar las cabeceras
  //o modificar las request como necesitasemos :D, solo por saberlo de momento no usaremos esto
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      //Interceptor--> funcionalidad que permite interceptar y modificar solicitudes HTTP y respuestas antes
      //de que lleguen al servidor o al cliente. (agregar encabezados, manejos de errores, transformacion de datos...)
      withInterceptors([logginInterceptor]) //aqui llamamos a la funcion que actuará como interceptor
    ),
  ],
}).catch((err) => console.error(err));
//Establecemos asi el provider del HTTPClient, porque no estamos trabajando con modulos,
//si no seria en el app module

//En caso de trabajar con modulos tendriamos algo asi en el app module
/*
@NgModule({
  declarations: [
    AppComponent,
    PlacesComponent,
    // ... etc
  ],
  imports: [BrowserModule, FormsModule],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}
*/
