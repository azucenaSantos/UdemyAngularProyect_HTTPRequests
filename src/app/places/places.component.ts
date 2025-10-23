import { Component, input, output } from '@angular/core';

import { Place } from './place.model';

@Component({
  selector: 'app-places',
  standalone: true,
  imports: [],
  templateUrl: './places.component.html',
  styleUrl: './places.component.css',
})
export class PlacesComponent {
  places = input.required<Place[]>();
  selectPlace = output<Place>(); //emite el sitio seleccionado (place) cada vez que hace click

  onSelectPlace(place: Place) {
    this.selectPlace.emit(place); //emite el place, por lo que podemos obtener el place 
    //desde el componente available-places.component.html
  }
}
