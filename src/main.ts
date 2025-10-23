import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, { providers: [provideHttpClient()] }).catch(
  (err) => console.error(err)
);
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
