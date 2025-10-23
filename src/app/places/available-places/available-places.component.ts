import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);

  isFetching = signal(false);
  error = signal('');

  private httpClient = inject(HttpClient); //servicio comun dado por angular para cualquier peticion HTTP
  private destroyRef = inject(DestroyRef);
  private placesService = inject(PlacesService);

  //Tambien podemos llamar al servicio desde el constructor
  //constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    //Cuando estamos en proceso de obtener datos ponemos el isFetching a true
    this.isFetching.set(true); //con esta variable desde la plantilla controlaremos si se muestra un mensaje de carga o no

    //En vez de hacer llamadas que repitan la estructura, creamos un servicio con 1 llamada y funciones para
    //cada una de las rutas a las que queremos acceder
    const subscription = this.placesService.loadAvailablePlaces().subscribe({
      next: (resData) => {
        //console.log(resData.places); //dentro del valor recibido accedemos a places
        //this.places.set(resData.places); //asignamos al signal de places la respuesta de la request

        //con el pipe + map hemos convertido los valores resultantes por lo que
        this.places.set(resData); //resData ya es el resultado de resData.places por lo que lo asignamos asi
      },
      error: (error: Error) => {
        //sabemos que va a ser de tipo error porque es el que pusimos en el throwError
        //Controlamos en caso de error (perdida de internet, problemas con el back...)
        //1.
        //this.error.set(error.message); //el message mostrará el texto acorde con el error 500 en este caso
        //2.
        /*this.error.set(
            'Something went wrong fetching the available places. Please try again later.'
          ); //O podemos personalizar el texto del error cuando tengamos un error en la petición*/
        //3.
        //Con el catch podemos acceder asi
        this.error.set(error.message); //y este message no será un texto super profesional si no el que pusimos arriba en el catchError
      },
      complete: () => {
        //Establecemos el isFetching a false porque ya hemos obtenido todos los datos
        this.isFetching.set(false);
      },
    });
    //*usamos localhots/3000 porque es el que tiene establecido el proyecto de backend como ruta de acceso*
    //Añadimos en el get <> el tipo de dato que vamos a recibir de la request
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  onSelectPlace(selectedPlace: Place) {
    //sabemos de que tipo será el event porque lo hemos configurado asi en el componente
    //event nos pasa el dato que emite el selectPlace del componente de app-places
    // this.httpClient
    //   .put('http://localhost:3000/user-places', {
    //     placeId: selectedPlace.id,
    //     //Los datos se envian como Json automaticamente
    //   })
    //   .subscribe({
    //     //sin el subscribe no se ejecuta la request, con el suscribe cuando hacemos
    //     //click ya vemos que en user-places se ha guardado la info del lugar sobre el que hice click
    //     next: (resData) => {
    //       console.log('enviado!', resData);
    //     },
    //     //complete, error...
    //   });

    //Con el servicio simplemente ya hacemos el put desde el servicio pasando el id y desde aqui llamamos a la
    //funcion acorde y hacemos el suscribe
    const suscription = this.placesService
      .addPlaceToUserPlaces(selectedPlace)
      .subscribe({
        next: (resData) => {
          console.log('añadido a favoritos!', resData);
        },
      });

    //Limpiamos si el componente es destruido
    this.destroyRef.onDestroy(() => {
      suscription.unsubscribe();
    });
  }
}
