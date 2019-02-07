import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase';

declare var gapi: any;


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$ : Observable<firebase.User>;
  calendarItems: any[];

  constructor(public fcAuth: AngularFireAuth) {
    this.initClient();
    this.user$ = fcAuth.authState;
   }

   initClient() {
      gapi.load('client', () => {
        console.log('client loaded')

        gapi.client.init({
          apiKey: 'AIzaSyDkYZrNM-ueUWGNYt82VM5TMOo4QpoNV8w',
          clientId: '846570368634-tm62hdb1tkk4km2vfimjfvacq90l7e1h.apps.googleusercontent.com',
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
// scope for G Calendar can be found at https://developers.google.com/identity/protocols/googlescopes
          scope: 'https://www.googleapis.com/auth/calendar'
        })
        gapi.client.load('calendar', 'v3', () => console.log('calendar loaded'));
      });
    }
    async login () {
      const googleAuth = gapi.auth2.getAuthInstance();
      const googleUser = await googleAuth.signIn();

      const token = googleUser.getAuthResponse().id_token;

      console.log(googleUser)

      const credential = auth.GoogleAuthProvider.credential(token);
      await this.fcAuth.auth.signInAndRetrieveDataWithCredential(credential);
    }

    logout() {
      this.fcAuth.auth.signOut();
    }

    async getCalendar() {
      const events = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime'
      })
      console.log(events)

      this.calendarItems = events.result.items;
    }
    async insertEvent() {
      const insert = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        start: {
          dateTime: hoursFromNow(2),
          timeZone: 'America/New_York'
        },
        end: {
          dateTime: hoursFromNow(3),
          timeZone: 'America/New_York'
        },
        summary: 'Enjoy Self!',
        description: "It's time to relax, learn, and have fun."

      })
      await this.getCalendar();
    }


}
const hoursFromNow = (n) => new Date(Date.now() + n * 1000 * 60 * 60).toISOString();