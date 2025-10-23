import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';

import { Place } from './place.model';
import { ErrorService } from '../shared/shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);

  private httpClient = inject(HttpClient);

  private errorService = inject(ErrorService);

  loadedUserPlaces = this.userPlaces.asReadonly();

  //Quiero que cuando añada un lugar a favoritos se recargen los favoritos, asi como cuando cargo todos los lugares
  //tambien se recargen los favoritos.

  loadAvailablePlaces() {
    return this.fetchPlaces(
      'places',
      'Something went wrong fetching the available places. Please try again later.'
    );
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      'user-places',
      'Something went wrong fetching your favourite places. Please try again later.'
    ).pipe(
      tap({
        //actualizamos datos en el servicio sin necesidad de un suscribe (que se hace en cada componente al llammar a la funcion)
        //aqui controlamos qué codigo ejecuar si hay un error, si emite un valor...
        next: (userPlaces) => {
          this.userPlaces.set(userPlaces);
          //asociamos al signal vacio, los userPlaces resultantes de la request
        },
      })
    );

    //tap--> operador para ejecutar codigo como lo hariamos en el suscribe pero sin suscribirnos
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlaces = this.userPlaces();

    //Evitar añadir un lugar ya añadido antes (si en el prev NO hay uno con id igual, añadimos al prev el seleccionado)
    if (!prevPlaces.some((p) => p.id === place.id)) {
      //Con lo siguiente los places que son los favoritos se actualizan segun se hace "añade" uno nuevo
      //this.userPlaces.update((prevPlaces) => [...prevPlaces, place]); //copia de los anteriores places + el nuevo place
      this.userPlaces.set([...prevPlaces, place]); //otra forma de actualizar
    } //en caso contrario, que si que haya ya un id igual a algun prev, no se añadirá el place

    return this.httpClient
      .put('http://localhost:3000/user-places', {
        placeId: place.id,
      })
      .pipe(
        //manejar diferentes errores del backend, porque ahora si hay errores se sigue ejecutando lo del los
        //favoritos aunque luego no se guarde realmente al recargar
        catchError((error) => {
          this.userPlaces.set(prevPlaces); //rollback en caso de error a los previous places que hemos almacenado de antes
          //para acceder a ellos y evitar errores

          //Ahora vamos añadir al momento del error un modal que indique el error al usuario
          //y pueda actuar ante el
          //Llamamos al servicio que controla el mostrar las modales
          this.errorService.showError('Failed to store selected place.');

          return throwError(() => new Error('Failed to store selected place.'));
        })
      );
  }

  removeUserPlace(place: Place) {}

  //Ahora tenemos el codigo del fetch de los places separado para poder
  //llamarlo desde las otras funciones publicas de este servicio
  //y a la vez llamar a estas funciones desde los componentes que necesitemos
  private fetchPlaces(url: string, errorMessage: string) {
    //url y mensaje de error como parámetros para personalizar el contenido de la función
    return this.httpClient
      .get<{ places: Place[] }>(`http://localhost:3000/${url}`)
      .pipe(
        map((resData) => resData.places),
        catchError((error) => {
          return throwError(() => new Error(`${errorMessage}`));
        }) //No se usa normalmente pero hay que saber que puede existir y entender los operadores, tanto esto como el map
        //No son crucialmente necesarios!!
      );
    //el pipe tambien se le pasa el catchError que tiene que devolver un nuevo observable siempre
  }
}
