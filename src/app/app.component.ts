import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserManagerService, UserState, User } from './user-manager.service';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  userName = '';

  private alive = true;

  constructor(private manager: UserManagerService) {

  }

  ngOnInit(): void {
   this.manager.stateChange
    .pipe(takeWhile(() => this.alive))
    .subscribe(({stateType, state}) => this.processState(stateType, state))
  }

  ngOnDestroy(): void {
    this.alive = false;
  }

  getUserClick() {
    this.manager.getUser();
  }

  private processState(stateType: UserState, state: User) {
    switch (stateType) {
      case UserState.GET_USER_SUCCESS:
        this.userName = state.name;
        break;
      case UserState.GET_USER:
        this.userName = 'loading...';
        break;
    }
  }
}
