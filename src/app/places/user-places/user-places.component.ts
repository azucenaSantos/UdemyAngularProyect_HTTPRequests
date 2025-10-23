import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {
  private httpClient = inject(HttpClient);
  private placesService = inject(PlacesService);
  private destroyRef = inject(DestroyRef);

  //favoritePlaces = signal<Place[] | undefined>(undefined);
  favoritePlaces = this.placesService.loadedUserPlaces;

  //COMO TENEMOS CODIGO DUPLICADO VAMOS A CREAR UN SERVICIO PARA UNIFICAR
  //CODIGO Y NO REPETIR TANTO CODIGO

  ngOnInit() {
    //accedemos a la funcion correspondiente del servicio comun de places.service
    const subscription = this.placesService.loadUserPlaces().subscribe({
      // next: (responseData) => {
      //   this.favoritePlaces.set(responseData);
      // }, --> obviamos porque ahora asociamos al favoritePlaces el signal del servicio
      complete: () => {
        console.log('I have all your favourite places');
      },
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  onRemovePlace(placeSelected: Place) {
    const subscription= this.placesService.removeUserPlace(placeSelected).subscribe();
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
    });
  }
}
